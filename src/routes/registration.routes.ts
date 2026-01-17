import express from 'express';
import {
  listAll,
  getAny,
  updateAny,
  removeAny,
  listMyRegistrations,
  createMyRegistration,
  getMyRegistration,
  removeMyRegistration,
  listMyCampers,
  createMyCamper,
  getMyCamper,
  updateMyCamper,
  removeMyCamper,
  checkCamperAmka,
  listAllCampers,
  removeAnyCamper,
  searchByAmka
} from '../controllers/registration.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import { validate, validateQuery } from '../middlewares/validate.middleware';
import {
  createCamperSchema,
  updateCamperSchema,
  checkCamperAmkaSchema  // From camper.validator.ts
} from '../validators/camper.validator';
import {
  createRegistrationSchema,
  updateRegistrationSchema,
  searchAmkaSchema,
  registrationQuerySchema  // Now from registration.validator.ts
} from '../validators/registration.validator';

const router = express.Router();

router.use(authenticate);

// User routes
router.post('/campers', validate(createCamperSchema), createMyCamper);
router.put('/campers/:id', validate(updateCamperSchema), updateMyCamper);
router.post('/campers/check-amka', validate(checkCamperAmkaSchema), checkCamperAmka);
router.get('/campers', listMyCampers);
router.get('/campers/:id', getMyCamper);
router.delete('/campers/:id', removeMyCamper);

router.post('/registrations', validate(createRegistrationSchema), createMyRegistration);
router.get('/registrations', listMyRegistrations);
router.get('/registrations/:id', getMyRegistration);
router.delete('/registrations/:id', removeMyRegistration);

// Admin routes
router.get('/admin/registrations', isAdmin, validateQuery(registrationQuerySchema), listAll);
router.post('/admin/registrations/search', isAdmin, validate(searchAmkaSchema), searchByAmka);
router.put('/admin/registrations/:id', isAdmin, validate(updateRegistrationSchema), updateAny);
router.delete('/admin/registrations/:id', isAdmin, removeAny);
router.get('/admin/registrations/:id', isAdmin, getAny);

router.get('/admin/campers', isAdmin, listAllCampers);
router.delete('/admin/campers/:id', isAdmin, removeAnyCamper);

export default router;