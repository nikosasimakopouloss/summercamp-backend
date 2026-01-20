import dotenv from "dotenv"
dotenv.config();

process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only-12345';


import { TestServer } from "./testSetup";
import { login, verifyToken } from '../services/auth.service';
import User, { IUser } from '../models/user.model';
import Role, { IRole } from '../models/role.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { ObjectId } from 'mongoose';
import { AuthPayload } from "../models/auth.model";
import { Schema } from "zod";

describe('Auth Service Tests', () => {
  let server: TestServer;
  let testUser: IUser;
  let adminRole: IRole;
  let readerRole: IRole;

  beforeAll(async () => {
    // Set JWT_SECRET for testing before starting server
    
    
    server = new TestServer();
    await server.start();
  });

  beforeEach(async () => {
    // Clean up before each test
    await server.cleanup();
    
    // Create test roles
    adminRole = await Role.create({
      role: 'ADMIN',
      description: 'Administrator role',
      active: true
    });

    readerRole = await Role.create({
      role: 'READER',
      description: 'Regular user role',
      active: true
    });

    // Create fresh test user for each test
    const hashedPassword = await bcrypt.hash('password123', 10);
    testUser = await User.create({
      username: "testuser",
      password: hashedPassword,
      firstname: "Test",
      lastname: "User",
      amka: "12345678901",
      email: "test@example.com",
      roles: [adminRole._id, readerRole._id]
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('login', () => {
    const createValidCredentials = () => ({
      username: 'testuser',
      password: 'password123'
    });

    it('should return user and token for valid credentials', async () => {
      const credentials = createValidCredentials();

      const result = await login(credentials.username, credentials.password);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const { user, token } = result!;
      
      // Check user fields (password field exists because delete is commented in auth service)
      expect(user._id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.firstname).toBe('Test');
      expect(user.lastname).toBe('User');
      expect(user.amka).toBe('12345678901');
      
      // Check token
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(10);
    });

    it('should return null for invalid username', async () => {
      const credentials = {
        username: 'nonexistentuser',
        password: 'password123'
      };

      const result = await login(credentials.username, credentials.password);
      expect(result).toBeNull();
    });

    it('should return null for incorrect password', async () => {
      const credentials = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const result = await login(credentials.username, credentials.password);
      expect(result).toBeNull();
    });

    it('should populate roles correctly in response', async () => {
      const credentials = createValidCredentials();

      const result = await login(credentials.username, credentials.password);
      expect(result).toBeDefined();
      
      const { user } = result!;
      
      // Check that roles are populated and have the correct structure
      expect(user.roles).toBeDefined();
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.roles).toHaveLength(2);
      
      // Cast to any to access role properties (since TypeScript doesn't know they're populated)
      const roles = user.roles as any[];
      
      expect(roles[0]._id.toString()).toBe(adminRole._id.toString());
      expect(roles[1]._id.toString()).toBe(readerRole._id.toString());
      
      // Check role properties
      expect(roles[0].role).toBe('ADMIN');
      expect(roles[1].role).toBe('READER');
      expect(roles[0].description).toBe('Administrator role');
      expect(roles[0].active).toBe(true);
    });

    it('should include correct payload in token', async () => {
      const credentials = createValidCredentials();

      const result = await login(credentials.username, credentials.password);
      expect(result).toBeDefined();
      
      const { token } = result!;
      
      // Verify the token using the same secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.userId).toBe(testUser._id.toString());
      expect(decoded.username).toBe('testuser');
      expect(decoded.email).toBe('test@example.com');
      expect(decoded.roles).toBeDefined();
      expect(Array.isArray(decoded.roles)).toBe(true);
      expect(decoded.roles).toHaveLength(2);
      
      // Fix TypeScript error by checking array has elements before accessing
      expect(decoded.roles[0].toString()).toBe(adminRole._id.toString());
      expect(decoded.roles[1].toString()).toBe(readerRole._id.toString());
      
      // Check token has expiration
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(24 * 60 * 60); // 24 hours in seconds
    });

    it('should handle users with no email', async () => {
      // Create user without email
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithoutEmail = await User.create({
        username: 'noemailuser',
        password: hashedPassword,
        firstname: 'No',
        lastname: 'Email',
        amka: '11111111111',
        roles: [readerRole._id]
      });

      const result = await login('noemailuser', 'password123');
      expect(result).toBeDefined();
      
      const { token } = result!;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.email).toBe('');
    });

    it('should handle users with empty string email', async () => {
      // Create user with empty email string
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithEmptyEmail = await User.create({
        username: 'emptyemailuser',
        password: hashedPassword,
        firstname: 'Empty',
        lastname: 'Email',
        amka: '22222222222',
        email: '',
        roles: [readerRole._id]
      });

      const result = await login('emptyemailuser', 'password123');
      expect(result).toBeDefined();
      
      const { token } = result!;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.email).toBe('');
    });

    it('should handle users with null email', async () => {
      // Create user with null email
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithNullEmail = await User.create({
        username: 'nullemailuser',
        password: hashedPassword,
        firstname: 'Null',
        lastname: 'Email',
        amka: '33333333333',
        email: "",
        roles: [readerRole._id] 
      });

      const result = await login('nullemailuser', 'password123');
      expect(result).toBeDefined();
      
      const { token } = result!;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.email).toBe('');
    });

    it('should handle users with no roles', async () => {
      // This should not happen because roles is required, but let's test edge case
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithoutRoles = await User.create({
        username: 'norolesuser',
        password: hashedPassword,
        firstname: 'No',
        lastname: 'Roles',
        amka: '44444444444',
        email: 'noroles@example.com',
        roles: []
      });

      const result = await login('norolesuser', 'password123');
      expect(result).toBeDefined();
      
      const { token } = result!;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.roles).toBeDefined();
      expect(Array.isArray(decoded.roles)).toBe(true);
      expect(decoded.roles).toHaveLength(0);
    });

    it('should handle role population correctly in token payload', async () => {
      // Create additional role
      const editorRole = await Role.create({
        role: 'EDITOR',
        description: 'Editor role',
        active: true
      });

      // Create user with multiple roles
      const hashedPassword = await bcrypt.hash('password123', 10);
      const multiRoleUser = await User.create({
        username: 'multiroleuser',
        password: hashedPassword,
        firstname: 'Multi',
        lastname: 'Role',
        amka: '55555555555',
        email: 'multi@example.com',
        roles: [adminRole._id, readerRole._id, editorRole._id]
      });

      const result = await login('multiroleuser', 'password123');
      expect(result).toBeDefined();
      
      const { token } = result!;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      expect(decoded.roles).toHaveLength(3);
      expect(decoded.roles[0].toString()).toBe(adminRole._id.toString());
      expect(decoded.roles[1].toString()).toBe(readerRole._id.toString());
      expect(decoded.roles[2].toString()).toBe(editorRole._id.toString());
    });

    it('should handle inactive roles', async () => {
      // Create inactive role
      const inactiveRole = await Role.create({
        role: 'INACTIVE',
        description: 'Inactive role',
        active: false
      });

      // Create user with inactive role
      const hashedPassword = await bcrypt.hash('password123', 10);
      const userWithInactiveRole = await User.create({
        username: 'inactiveroleuser',
        password: hashedPassword,
        firstname: 'Inactive',
        lastname: 'Role',
        amka: '66666666666',
        email: 'inactive@example.com',
        roles: [inactiveRole._id]
      });

      const result = await login('inactiveroleuser', 'password123');
      expect(result).toBeDefined();
      
      const { user, token } = result!;
      
      // The role should still be populated even if inactive
      const roles = user.roles as any[];
      expect(roles).toBeDefined();
      expect(roles).toHaveLength(1);
      expect(roles[0].role).toBe('INACTIVE');
      expect(roles[0].active).toBe(false);
      
      // Token should include the role ID even if inactive
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      expect(decoded.roles).toHaveLength(1);
      expect(decoded.roles[0].toString()).toBe(inactiveRole._id.toString());
    });

    it('should handle user with case-insensitive username lookup', async () => {
      // User has username 'testuser' (lowercase per model)
      // Test with uppercase input
      const result = await login('TESTUSER', 'password123');
      expect(result).toBeDefined(); // Should find user because of lowercase: true in schema
      
      const { user } = result!;
      expect(user.username).toBe('testuser');
    });

    it('should handle user with trimmed username', async () => {
      // Test with whitespace around username
      const result = await login('  testuser  ', 'password123');
      expect(result).toBeDefined(); // Should find user because of trim: true in schema
      
      const { user } = result!;
      expect(user.username).toBe('testuser');
    });
  });

  describe('verifyToken', () => {
    const createValidPayload = () => ({
      userId: testUser._id,
      username: 'testuser',
      email: 'test@example.com',
      roles: [adminRole._id, readerRole._id] 
    });

    it('should return payload for valid token', async () => {
      const payload = createValidPayload();
      
      // Create token with proper secret
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      // Type assertion to AuthPayload
      const decoded = result as AuthPayload as any;
      expect(decoded.userId.toString()).toBe(payload.userId.toString());
      expect(decoded.username).toBe(payload.username);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.roles).toHaveLength(2);
      expect(decoded.roles[0].toString()).toBe(adminRole._id.toString());
      expect(decoded.roles[1].toString()).toBe(readerRole._id.toString());
    });

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid.token.here');
      expect(result).toBeNull();
    });

    it('should return null for expired token', () => {
      const payload = createValidPayload();
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '-1s' }); // Already expired
      
      const result = verifyToken(token);
      expect(result).toBeNull();
    });

    it('should return null for malformed token', () => {
      const result = verifyToken('malformed.token');
      expect(result).toBeNull();
    });

    it('should return null for empty token', () => {
      const result = verifyToken('');
      expect(result).toBeNull();
    });

    it('should return null for null token', () => {
      const result = verifyToken(null as any);
      expect(result).toBeNull();
    });

    it('should return null for undefined token', () => {
      const result = verifyToken(undefined as any);
      expect(result).toBeNull();
    });

    it('should return null for token with wrong secret', () => {
      const payload = createValidPayload();
      const token = jwt.sign(payload, 'wrong-secret-key'); // Different secret
      
      const result = verifyToken(token);
      expect(result).toBeNull();
    });

    it('should correctly parse token with extra fields', () => {
      const payload = {
        userId: testUser._id,
        username: 'testuser',
        email: 'test@example.com',
        roles: [adminRole._id],
        // Extra fields that TypeScript doesn't know about
        extraField: 'extra',
        anotherField: 123,
        // iat: Math.floor(Date.now() / 1000),
        // exp: Math.floor(Date.now() / 1000) + 3600
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      // TypeScript will only recognize AuthPayload fields, extra fields are ignored
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('roles');

      // To check extra fields, cast to any
      const resultAny = result as any;
      expect(resultAny.extraField).toBe('extra');
      expect(resultAny.anotherField).toBe(123);
    });

    it('should handle token with additional standard JWT fields', () => {
      const payload = createValidPayload();
      
      // Sign with additional options that add standard fields
      const token = jwt.sign(payload, process.env.JWT_SECRET!, { 
        expiresIn: '1h',
        issuer: 'test-issuer',
        audience: 'test-audience',
        subject: 'test-subject'
      });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result!.userId.toString()).toBe(testUser._id.toString());
      expect(result!.username).toBe('testuser');
    });

    // it('should handle token with role IDs as ObjectId strings', () => {
    //   const newRoleId = new mongoose.Types.ObjectId();
    //   const payload = {
    //     userId: testUser._id,
    //     username: 'testuser',
    //     email: 'test@example.com',
    //     roles: [newRoleId]
    //   };

    //   const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
    //   const result = verifyToken(token) ;
      
    //   expect(result).toBeDefined();
    //   expect(result!.roles).toHaveLength(1);
    //   expect(result!.roles[0].toString()).toBe(newRoleId.toString());
    //   expect(result!.roles[0].toString()).toMatch(/^[0-9a-fA-F]{24}$/); // Valid ObjectId format
    // });



  








    it('should handle token with empty roles array', () => {
      const payload = {
        userId: testUser._id,
        username: 'testuser',
        email: 'test@example.com',
        roles: []
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result!.roles).toEqual([]);
      expect(result!.roles).toHaveLength(0);
    });

    it('should handle token without email field', () => {
      const payload = {
        userId: testUser._id,
        username: 'testuser',
        roles: [adminRole._id]
        // No email field
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      const result = verifyToken(token);
      
      expect(result).toBeDefined();
      expect(result!.userId.toString()).toBe(testUser._id.toString());
      expect(result!.username).toBe('testuser');
      expect(result!.email).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should produce token that can be verified by verifyToken', async () => {
      const credentials = {
        username: 'testuser',
        password: 'password123'
      };

      // Login to get token
      const loginResult = await login(credentials.username, credentials.password);
      expect(loginResult).toBeDefined();
      
      const { token } = loginResult!;
      
      // Verify the token using verifyToken
      const verificationResult = verifyToken(token);
      
      expect(verificationResult).toBeDefined();
      expect(verificationResult?.userId.toString()).toBe(testUser._id.toString());
      expect(verificationResult?.username).toBe('testuser');
      expect(verificationResult?.email).toBe('test@example.com');
      expect(verificationResult?.roles).toHaveLength(2);
    });

    it('should not verify token from different user', async () => {
      // Create another user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const anotherUser = await User.create({
        username: 'anotheruser',
        password: hashedPassword,
        firstname: 'Another',
        lastname: 'User',
        amka: '77777777777',
        email: 'another@example.com',
        roles: [readerRole._id]
      });

      // Login with another user
      const loginResult = await login('anotheruser', 'password123');
      expect(loginResult).toBeDefined();
      
      const { token } = loginResult!;
      
      // Verify the token - it should be valid
      const verificationResult = verifyToken(token);
      
      expect(verificationResult).toBeDefined();
      // But user ID should be different from testUser
      expect(verificationResult?.userId.toString()).toBe(anotherUser._id.toString());
      expect(verificationResult?.userId.toString()).not.toBe(testUser._id.toString());
    });

    it('should work with token containing only reader role', async () => {
      // Create user with only reader role
      const hashedPassword = await bcrypt.hash('password123', 10);
      const regularUser = await User.create({
        username: 'regularuser',
        password: hashedPassword,
        firstname: 'Regular',
        lastname: 'User',
        amka: '88888888888',
        email: 'regular@example.com',
        roles: [readerRole._id]
      });

      const loginResult = await login('regularuser', 'password123');
      expect(loginResult).toBeDefined();
      
      const { token } = loginResult!;
      const verificationResult = verifyToken(token) as AuthPayload ;
      
      expect(verificationResult).toBeDefined();
      expect(verificationResult?.userId.toString()).toBe(regularUser._id.toString());
      expect(verificationResult?.roles).toHaveLength(1);
      expect(verificationResult?.roles.toString()).toBe(readerRole._id.toString());
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty username', async () => {
      const result = await login('', 'password123');
      expect(result).toBeNull();
    });

    it('should handle empty password', async () => {
      const result = await login('testuser', '');
      expect(result).toBeNull();
    });

    it('should handle null username', async () => {
      const result = await login(null as any, 'password123');
      expect(result).toBeNull();
    });

    // it('should handle null password', async () => {
    //   const result = await login('testuser', null as any);
    //   expect(result).toBeNull();
    // });
    it('should handle null password', async () => {
    await expect(login('testuser', null as any)).rejects.toThrow();
    });








    it('should handle undefined username', async () => {
      const result = await login(undefined as any, 'password123');
      expect(result).toBeNull();
    });

    // it('should handle undefined password', async () => {
    //   const result = await login('testuser', undefined as any);
    //   expect(result).toBeNull();
    // });
    it('should handle undefined password', async () => {
    await expect(login('testuser', undefined as any)).rejects.toThrow();
  });








    it('should handle very long username', async () => {
      const longUsername = 'a'.repeat(1000);
      const result = await login(longUsername, 'password123');
      expect(result).toBeNull();
    });

    it('should handle very long password', async () => {
      const longPassword = 'a'.repeat(1000);
      const result = await login('testuser', longPassword);
      expect(result).toBeNull(); // Because password won't match
    });

    it('should handle special characters in username', async () => {
      const specialUsername = 'test@user#$%';
      const result = await login(specialUsername, 'password123');
      expect(result).toBeNull();
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'pass@word#123$%^';
      
      // Create a user with special character password
      const hashedPassword = await bcrypt.hash(specialPassword, 10);
      const specialUser = await User.create({
        username: 'specialuser',
        password: hashedPassword,
        firstname: 'Special',
        lastname: 'User',
        amka: '99999999999',
        email: 'special@example.com',
        roles: [readerRole._id]
      });

      const result = await login('specialuser', specialPassword);
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should handle user with spaces in username', async () => {
      const spacedUsername = 'test user';
      
      // Create user with space in username (should be trimmed)
      const hashedPassword = await bcrypt.hash('password123', 10);
      const spacedUser = await User.create({
        username: spacedUsername,
        password: hashedPassword,
        firstname: 'Spaced',
        lastname: 'User',
        amka: '10101010101',
        email: 'spaced@example.com',
        roles: [readerRole._id]
      });

      const result = await login(spacedUsername, 'password123');
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('should handle user with uppercase letters in username (stored as lowercase)', async () => {
      const uppercaseUsername = 'TESTUSER';
      
      // Note: username is stored as lowercase, so 'TESTUSER' won't match 'testuser'
      const result = await login(uppercaseUsername, 'password123');
      expect(result).toBeDefined(); // Should match because of lowercase: true
      
      if (result) {
        expect(result.user.username).toBe('testuser'); // Stored as lowercase
      }
    });

    it('should handle whitespace around credentials', async () => {
      const credentials = {
        username: '  testuser  ', // With spaces
        password: '  password123  ' // With spaces
      };

      const result = await login(credentials.username, credentials.password);
      expect(result).toBeDefined(); // Should work because of trim: true
    });

    it('should handle user with AMKA validation', async () => {
      // User with invalid AMKA format (less than 11 digits)
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // This will fail because AMKA must be exactly 11 digits
      try {
        await User.create({
          username: 'invalidamka',
          password: hashedPassword,
          firstname: 'Invalid',
          lastname: 'AMKA',
          amka: '12345', // Invalid: less than 11 digits
          email: 'invalid@example.com',
          roles: [readerRole._id]
        });
        fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('AMKA must be exactly 11 digits');
      }
    });

    it('should handle user with duplicate username', async () => {
      // Try to create user with same username
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      try {
        await User.create({
          username: 'testuser', // Same as existing user
          password: hashedPassword,
          firstname: 'Duplicate',
          lastname: 'User',
          amka: '12121212121',
          email: 'duplicate@example.com',
          roles: [readerRole._id]
        });
        fail('Should have thrown duplicate key error');
      } catch (error: any) {
        // Should fail because username is unique
        expect(error).toBeDefined();
      }
    });

    it('should handle user with duplicate AMKA', async () => {
      // Try to create user with same AMKA
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      try {
        await User.create({
          username: 'duplicateamka',
          password: hashedPassword,
          firstname: 'Duplicate',
          lastname: 'AMKA',
          amka: '12345678901', // Same as testUser
          email: 'duplicateamka@example.com',
          roles: [readerRole._id]
        });
        fail('Should have thrown duplicate key error');
      } catch (error: any) {
        // Should fail because AMKA is unique
        expect(error).toBeDefined();
      }
    });
  });
});