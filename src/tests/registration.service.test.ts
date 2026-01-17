import { TestServer } from "./testSetup";
import { 
  findAllRegistrations, 
  findRegistrationById, 
  findRegistrationsByUser,
  findRegistrationsByCamper,
  createRegistration,
  updateRegistration,
  deleteRegistration,
  findRegistrationsByParentAmka,
  findRegistrationByCamperAmka
} from '../services/registration.service';
import { IRegistration, Registration } from '../models/registration.model';
import User from '../models/user.model';
import { Camper } from '../models/registration.model';
import mongoose from 'mongoose';

describe('Registration Service Tests', () => {
  let server: TestServer;
  let testUser: any;
  let testCamper: any;

  beforeAll(async () => {
    server = new TestServer();
    await server.start();
  });

  beforeEach(async () => {
    // Clean up before each test
    await server.cleanup();
    
    // Create fresh test user for each test
    testUser = await User.create({
      username: "testparent",
      password: "password123",
      firstname: "Test",
      lastname: "Parent",
      amka: "12345678901",
      email: "parent@test.com"
    });

    // Create fresh test camper for each test
    testCamper = await Camper.create({
      fullName: "Test Camper",
      dateOfBirth: "2010-01-01",
      amka: "98765432109",
      visitorType: "Νέος κατασκηνωτής",
      healthDeclarationAccepted: true,
      parent: testUser._id
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('createRegistration', () => {

     const CAMP_PERIODS = {
    A: "A' (16/6 - 30/6)" as const,
    B: "B' (17/7 - 15/7)" as const,
    GAMMA: "Γ' (16/7 - 30/7)" as const,
    DELTA: "Δ' (31/7 - 14/8) Μόνο για την Φωλιά" as const,
    EPSILON: "E' (17/8 - 31/8) Μόνο για την Φωλιά" as const
  };




    const createValidPayload = () : Partial<IRegistration> => ({
      camper: null as any, // Will be set in each test
      user: null as any, // Will be set in each test
      campType: 'Η Φωλιά του Παιδιού' as const,
      campPeriod: CAMP_PERIODS.A,
      beneficiary: 'Μητέρα' as const,
      motherName: 'Maria',
      fatherName: 'George',
      socialSecurityFund: '123456789',
      registrationDate: new Date(),
      isActive: true,
      notes: 'Test registration'
    });

    it('should create a new registration successfully', async () => {
      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = testUser._id;

      const result = await createRegistration(payload);

      expect(result).toBeDefined();
      expect(result.camper.toString()).toBe(testCamper._id.toString());
      expect(result.user.toString()).toBe(testUser._id.toString());
      expect(result.campType).toBe('Η Φωλιά του Παιδιού');
    });

    it('should throw error when camper not found', async () => {
      const invalidCamperId = new mongoose.Types.ObjectId();
      const payload = createValidPayload();
      payload.camper = invalidCamperId;
      payload.user = testUser._id;

      await expect(createRegistration(payload))
        .rejects
        .toThrow('Camper not found');
    });

    it('should throw error when user not found', async () => {
      const invalidUserId = new mongoose.Types.ObjectId();
      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = invalidUserId;

      await expect(createRegistration(payload))
        .rejects
        .toThrow('User not found');
    });

    it('should throw error when camper does not belong to user', async () => {
      // Create another user
      const anotherUser = await User.create({
        username: "anotheruser",
        password: "password123",
        firstname: "Another",
        lastname: "User",
        amka: "11111111111",
        email: "another@test.com"
      });

      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = anotherUser._id;

      await expect(createRegistration(payload))
        .rejects
        .toThrow('Camper does not belong to this user');
    });

    it('should throw error for duplicate registration', async () => {
      // First registration
      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = testUser._id;

      await createRegistration(payload);

      // Try to create duplicate
      await expect(createRegistration(payload))
        .rejects
        .toThrow('Registration already exists for this camper and period');
    });

    it('should throw error for invalid camp period for Ο Παράδεισος του Παιδιού', async () => {
      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = testUser._id;
      payload.campType = 'Ο Παράδεισος του Παιδιού';
      payload.campPeriod = CAMP_PERIODS.DELTA  ;

      await expect(createRegistration(payload))
        .rejects
        .toThrow('This camp period is not available for selected camp type');
    });

    it('should allow valid camp period for Ο Παράδεισος του Παιδιού', async () => {
      const payload = createValidPayload();
      payload.camper = testCamper._id;
      payload.user = testUser._id;
      payload.campType = 'Ο Παράδεισος του Παιδιού';
      payload.campPeriod = "A' (16/6 - 30/6)";

      const result = await createRegistration(payload);
      expect(result).toBeDefined();
      expect(result.campType).toBe('Ο Παράδεισος του Παιδιού');
    });
  });

  describe('findAllRegistrations', () => {
    it('should return all registrations', async () => {
      // Create a registration first
      await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });

      const result = await findAllRegistrations();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findRegistrationById', () => {
    it('should return registration by id', async () => {
      const registration = await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });

      const result = await findRegistrationById(registration._id.toString());

      expect(result).toBeDefined();
      expect(result?._id.toString()).toBe(registration._id.toString());
    });

    it('should return null for non-existent id', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const result = await findRegistrationById(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('updateRegistration', () => {
    let registration: any;

    beforeEach(async () => {
      // Create a registration to update
      registration = await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });
    });

    it('should update registration successfully', async () => {
      const updatePayload = {
        isActive: false,
        notes: 'Updated notes'
      };

      const result = await updateRegistration(registration._id.toString(), updatePayload);

      expect(result).toBeDefined();
      expect(result?.isActive).toBe(false);
      expect(result?.notes).toBe('Updated notes');
    });

    it('should throw error when trying to change user or camper', async () => {
      const newUserId = new mongoose.Types.ObjectId();
      const updatePayload = {
        user: newUserId
      };

      await expect(updateRegistration(registration._id.toString(), updatePayload))
        .rejects
        .toThrow('Cannot change user or camper for existing registration');
    });
  });

  describe('deleteRegistration', () => {
    it('should delete registration successfully', async () => {
      const registration = await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });

      const result = await deleteRegistration(registration._id.toString());
      expect(result).toBeDefined();
      
      // Verify it's deleted
      const deletedRegistration = await Registration.findById(registration._id);
      expect(deletedRegistration).toBeNull();
    });
  });

  describe('findRegistrationsByParentAmka', () => {
    it('should return registrations by parent AMKA', async () => {
      await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });

      const result = await findRegistrationsByParentAmka(testUser.amka);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent parent AMKA', async () => {
      const result = await findRegistrationsByParentAmka('00000000000');
      expect(result).toEqual([]);
    });
  });

  describe('findRegistrationByCamperAmka', () => {
    it('should return registration by camper AMKA', async () => {
      const registration = await Registration.create({
        camper: testCamper._id,
        user: testUser._id,
        campType: 'Η Φωλιά του Παιδιού',
        campPeriod: "A' (16/6 - 30/6)",
        beneficiary: 'Μητέρα',
        motherName: 'Maria',
        fatherName: 'George',
        socialSecurityFund: '123456789',
        registrationDate: new Date(),
        isActive: true
      });

      const result = await findRegistrationByCamperAmka(testCamper.amka);

      expect(result).toBeDefined();
      expect(result?._id.toString()).toBe(registration._id.toString());
      // Note: The camper field might be populated, so we need to check the ID properly
      expect(result?.camper._id.toString()).toBe(testCamper._id.toString());
    });

    it('should return null for non-existent camper AMKA', async () => {
      const result = await findRegistrationByCamperAmka('00000000000');
      expect(result).toBeNull();
    });
  });
});