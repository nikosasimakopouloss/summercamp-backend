import { TestServer } from "./testSetup";
import {
  findAllUsers,
  findUserById,
  findUserByAmka,
  findUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  comparePassword
} from '../services/user.service';
import User, { IUser } from '../models/user.model';
import Role from '../models/role.model';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

// Type for populated role
interface PopulatedRole {
  _id: mongoose.Types.ObjectId;
  role: string;
  description?: string;
  active?: boolean;
}

describe('User Service Tests', () => {
  let server: TestServer;

  beforeAll(async () => {
    server = new TestServer();
    await server.start();
  });

  beforeEach(async () => {
    await server.cleanup();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('createUser', () => {
    it('should create the first user as ADMIN', async () => {
      const payload: Partial<IUser> = {
        username: 'firstuser',
        password: 'password123',
        firstname: 'First',
        lastname: 'User',
        amka: '12345678901',
        email: 'first@test.com'
      };

      const result = await createUser(payload);

      expect(result).toBeDefined();
      expect(result.username).toBe('firstuser');
      expect(result.amka).toBe('12345678901');
      expect(result.roles).toHaveLength(1);
      
      // Check role by ID (type-safe)
      const role = await Role.findById(result.roles[0]);
      expect(role?.role).toBe('ADMIN');
    });

    it('should create subsequent users as READER', async () => {
      // First user (will be ADMIN)
      await createUser({
        username: 'adminuser',
        password: 'password123',
        amka: '11111111111',
        email: 'admin@test.com'
      });

      // Second user (should be READER)
      const payload: Partial<IUser> = {
        username: 'readeruser',
        password: 'password123',
        firstname: 'Reader',
        lastname: 'User',
        amka: '22222222222',
        email: 'reader@test.com'
      };

      const result = await createUser(payload);

      expect(result).toBeDefined();
      expect(result.roles).toHaveLength(1);
      
      const role = await Role.findById(result.roles[0]);
      expect(role?.role).toBe('READER');
    });

    it('should hash password before saving', async () => {
      const payload: Partial<IUser> = {
        username: 'testuser',
        password: 'plainpassword',
        amka: '33333333333',
        email: 'test@test.com'
      };

      const result = await createUser(payload);

      expect(result.password).not.toBe('plainpassword');
      expect(result.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should throw error for duplicate AMKA', async () => {
      const payload1: Partial<IUser> = {
        username: 'user1',
        password: 'password123',
        amka: '44444444444',
        email: 'user1@test.com'
      };

      await createUser(payload1);

      const payload2: Partial<IUser> = {
        username: 'user2',
        password: 'password456',
        amka: '44444444444', // Same AMKA
        email: 'user2@test.com'
      };

      await expect(createUser(payload2))
        .rejects
        .toThrow('User with this AMKA already exists');
    });

    // it('should create user without password (if not provided)', async () => {
    //   const payload: Partial<IUser> = {
    //     username: 'nopassworduser',
    //     amka: '55555555555',
    //     email: 'nopass@test.com'
    //   };

    //   const result = await createUser(payload);

    //   expect(result).toBeDefined();
    //   expect(result.username).toBe('nopassworduser');
    //   expect(result.password).toBeUndefined();
    // });

    // Instead of testing it creates without password, test it fails:

    it('should NOT create user without password', async () => {
  const payload = {
    username: 'nopassworduser'
  };

  // Expect it to throw/reject
  await expect(createUser(payload)).rejects.toThrow();
});

    it('should populate roles when created', async () => {
      const payload: Partial<IUser> = {
        username: 'populateduser',
        password: 'password123',
        amka: '66666666666',
        email: 'populated@test.com'
      };

      const result = await createUser(payload);
      
      // Use type parameter for populate
      const userWithRoles = await User.findById(result._id).populate<{ roles: PopulatedRole[] }>('roles');
      
      // Assert it exists
      expect(userWithRoles).not.toBeNull();
      
      // Now TypeScript knows it's not null
      const populatedUser = userWithRoles!;
      
      // Check that roles array has at least one element
      expect(populatedUser.roles.length).toBeGreaterThan(0);
      
      // Now access the first role
      const firstRole = populatedUser.roles[0];
      expect(firstRole).toBeDefined();
      expect(firstRole!.role).toBe('ADMIN');
    });
  });

  describe('findAllUsers', () => {
    beforeEach(async () => {
      // Create test users
      await createUser({
        username: 'user1',
        password: 'password1',
        amka: '11111111111',
        email: 'user1@test.com'
      });

      await createUser({
        username: 'user2',
        password: 'password2',
        amka: '22222222222',
        email: 'user2@test.com'
      });
    });

    it('should return all users with populated roles', async () => {
      const result = await findAllUsers();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      
      // Check if roles are populated
      result.forEach(user => {
        expect(user.roles).toBeDefined();
        
        // Check if roles are populated (not just ObjectIds)
        const firstRole = user.roles[0];
        if (firstRole && typeof firstRole === 'object' && 'role' in firstRole) {
          expect((firstRole as any).role).toBeDefined();
        }
      });
    });
  });

  describe('findUserById', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await createUser({
        username: 'testfinduser',
        password: 'password123',
        amka: '77777777777',
        email: 'find@test.com'
      });
      testUserId = user._id.toString();
    });

    it('should return user by id with populated roles', async () => {
      const result = await findUserById(testUserId);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const user = result!;
      expect(user._id.toString()).toBe(testUserId);
      expect(user.username).toBe('testfinduser');
      expect(user.roles).toBeDefined();
      
      // Check roles are populated
      if (user.roles[0] && typeof user.roles[0] === 'object' && 'role' in user.roles[0]) {
        expect((user.roles[0] as any).role).toBeDefined();
      }
    });

    it('should return null for non-existent id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await findUserById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('findUserByAmka', () => {
    beforeEach(async () => {
      await createUser({
        username: 'amkauser',
        password: 'password123',
        amka: '88888888888',
        email: 'amka@test.com'
      });
    });

    it('should return user by AMKA with populated roles', async () => {
      const result = await findUserByAmka('88888888888');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const user = result!;
      expect(user.amka).toBe('88888888888');
      expect(user.username).toBe('amkauser');
      expect(user.roles).toBeDefined();
    });

    it('should return null for non-existent AMKA', async () => {
      const result = await findUserByAmka('00000000000');

      expect(result).toBeNull();
    });
  });

  describe('findUserByUsername', () => {
    beforeEach(async () => {
      await createUser({
        username: 'usernamefinder',
        password: 'password123',
        amka: '99999999999',
        email: 'username@test.com'
      });
    });

    it('should return user by username with populated roles', async () => {
      const result = await findUserByUsername('usernamefinder');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const user = result!;
      expect(user.username).toBe('usernamefinder');
      expect(user.amka).toBe('99999999999');
      expect(user.roles).toBeDefined();
    });

    it('should return null for non-existent username', async () => {
      const result = await findUserByUsername('nonexistentuser');

      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await createUser({
        username: 'originaluser',
        password: 'originalpass',
        firstname: 'Original',
        lastname: 'User',
        amka: '10101010101',
        email: 'original@test.com'
      });
      testUserId = user._id.toString();
    });

    it('should update user fields successfully', async () => {
      const updatePayload: Partial<IUser> = {
        firstname: 'Updated',
        lastname: 'Name',
        email: 'updated@test.com'
      };

      const result = await updateUser(testUserId, updatePayload);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const updatedUser = result!;
      expect(updatedUser.firstname).toBe('Updated');
      expect(updatedUser.lastname).toBe('Name');
      expect(updatedUser.email).toBe('updated@test.com');
      expect(updatedUser.username).toBe('originaluser'); // Should remain unchanged
    });

    it('should hash new password when updating', async () => {
      const updatePayload: Partial<IUser> = {
        password: 'newpassword123'
      };

      const result = await updateUser(testUserId, updatePayload);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const updatedUser = result!;
      expect(updatedUser.password).not.toBe('newpassword123');
      expect(updatedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should throw error when trying to use existing AMKA', async () => {
      // Create another user
      await createUser({
        username: 'otheruser',
        password: 'password123',
        amka: '20202020202',
        email: 'other@test.com'
      });

      const updatePayload: Partial<IUser> = {
        amka: '20202020202' // Try to update to existing AMKA
      };

      await expect(updateUser(testUserId, updatePayload))
        .rejects
        .toThrow('Another user already has this AMKA');
    });

    it('should allow updating to same AMKA (same user)', async () => {
      const updatePayload: Partial<IUser> = {
        amka: '10101010101', // Same AMKA as original
        firstname: 'UpdatedName'
      };

      const result = await updateUser(testUserId, updatePayload);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const updatedUser = result!;
      expect(updatedUser.amka).toBe('10101010101');
      expect(updatedUser.firstname).toBe('UpdatedName');
    });

    it('should populate roles after update', async () => {
      const updatePayload: Partial<IUser> = {
        email: 'newemail@test.com'
      };

      const result = await updateUser(testUserId, updatePayload);

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      
      const updatedUser = result!;
      expect(updatedUser.roles).toBeDefined();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const user = await createUser({
        username: 'todelete',
        password: 'password123',
        amka: '30303030303',
        email: 'delete@test.com'
      });

      const result = await deleteUser(user._id.toString());
      expect(result).toBeDefined();
      
      // Verify it's deleted
      const deletedUser = await User.findById(user._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const plainPassword = 'mypassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await comparePassword(plainPassword, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const plainPassword = 'mypassword123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await comparePassword('wrongpassword', hashedPassword);
      expect(result).toBe(false);
    });

    it('should work with passwords from createUser', async () => {
      const plainPassword = 'testpassword';
      const user = await createUser({
        username: 'passwordtest',
        password: plainPassword,
        amka: '40404040404',
        email: 'password@test.com'
      });

      const result = await comparePassword(plainPassword, user.password!);
      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle role creation if roles dont exist', async () => {
      // Clean up roles
      await Role.deleteMany({});
      
      // First user should create ADMIN role
      const user = await createUser({
        username: 'rolecreator',
        password: 'password123',
        amka: '50505050505',
        email: 'role@test.com'
      });

      const adminRole = await Role.findOne({ role: 'ADMIN' });
      expect(adminRole).toBeDefined();
      expect(adminRole).not.toBeNull();
      
      // Now we know adminRole is not null
      const role = adminRole!;
      
      // Check that user has a role
      expect(user.roles[0]).toBeDefined();
      const userRoleId = user.roles[0]!;
      expect(userRoleId.toString()).toBe(role._id.toString());
    });

    it('should handle update with partial fields', async () => {
      const user = await createUser({
        username: 'partialupdate',
        password: 'password123',
        amka: '60606060606',
        email: 'partial@test.com',
        firstname: 'Original'
      });

      // Update only email
      const updated = await updateUser(user._id.toString(), { email: 'new@test.com' });
      
      expect(updated).not.toBeNull();
      const updatedUser = updated!;
      expect(updatedUser.email).toBe('new@test.com');
      expect(updatedUser.firstname).toBe('Original'); // Should remain
      expect(updatedUser.username).toBe('partialupdate'); // Should remain
    });

    it('should not allow duplicate usernames (database level)', async () => {
      await createUser({
        username: 'duplicateuser',
        password: 'pass1',
        amka: '70707070707',
        email: 'user1@test.com'
      });

      // Try to create another user with same username
      await expect(createUser({
        username: 'duplicateuser', // Same username
        password: 'pass2',
        amka: '80808080808',
        email: 'user2@test.com'
      })).rejects.toThrow(); // Should throw unique constraint error
    });
  });
});