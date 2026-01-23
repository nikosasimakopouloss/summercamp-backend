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
  checkCamperAmkaSchema
} from '../validators/camper.validator';
import {
  createRegistrationSchema,
  updateRegistrationSchema,
  searchAmkaSchema,
  registrationQuerySchema
} from '../validators/registration.validator';

const router = express.Router();

router.use(authenticate);

// ========== USER CAMPER ROUTES ==========

/**
 * @openapi
 * /registrations/campers:
 *  post:
 *    summary: Create a new camper (for logged-in user)
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/Camper'
 *    responses: 
 *      201:
 *        description: Camper created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Camper'
 *      400:
 *        description: Validation error
 *      401:
 *        description: Unauthorized - Authentication required
 */
router.post('/campers', validate(createCamperSchema), createMyCamper);

/**
 * @openapi
 * /registrations/campers/{id}:
 *  put:
 *    summary: Update camper by ID (for logged-in user)
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Camper ID
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/Camper'
 *    responses: 
 *      200:
 *        description: Camper updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Camper'
 *      400:
 *        description: Validation error
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: Camper not found
 */
router.put('/campers/:id', validate(updateCamperSchema), updateMyCamper);

/**
 * @openapi
 * /registrations/campers/check-amka:
 *  post:
 *    summary: Check if camper AMKA is available
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            type: object
 *            required: [amka]
 *            properties:
 *              amka:
 *                type: string
 *                pattern: '^\d{11}$'
 *                example: "12345678901"
 *    responses: 
 *      200:
 *        description: AMKA availability status
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                available:
 *                  type: boolean
 *                message:
 *                  type: string
 *      400:
 *        description: Invalid AMKA format
 *      401:
 *        description: Unauthorized - Authentication required
 */
router.post('/campers/check-amka', validate(checkCamperAmkaSchema), checkCamperAmka);

/**
 * @openapi
 * /registrations/campers:
 *  get:
 *    summary: Get all campers for logged-in user
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    responses: 
 *      200:
 *        description: List of user's campers
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Camper'
 *      401:
 *        description: Unauthorized - Authentication required
 */
router.get('/campers', listMyCampers);

/**
 * @openapi
 * /registrations/campers/{id}:
 *  get:
 *    summary: Get camper by ID (for logged-in user)
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Camper ID
 *    responses: 
 *      200:
 *        description: Camper details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Camper'
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: Camper not found
 */
router.get('/campers/:id', getMyCamper);

/**
 * @openapi
 * /registrations/campers/{id}:
 *  delete:
 *    summary: Delete camper by ID (for logged-in user)
 *    tags: [Campers]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Camper ID
 *    responses: 
 *      200:
 *        description: Camper deleted successfully
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: Camper not found
 */
router.delete('/campers/:id', removeMyCamper);

// ========== USER REGISTRATION ROUTES ==========

/**
 * @openapi
 * /registrations/registrations:
 *  post:
 *    summary: Create a new camp registration (for logged-in user)
 *    tags: [Registrations]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/Registration'
 *    responses: 
 *      201:
 *        description: Registration created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Registration'
 *      400:
 *        description: Validation error
 *      401:
 *        description: Unauthorized - Authentication required
 */
router.post('/registrations', validate(createRegistrationSchema), createMyRegistration);

/**
 * @openapi
 * /registrations/registrations:
 *  get:
 *    summary: Get all registrations for logged-in user
 *    tags: [Registrations]
 *    security:
 *      - bearerAuth: []
 *    responses: 
 *      200:
 *        description: List of user's registrations
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Registration'
 *      401:
 *        description: Unauthorized - Authentication required
 */
router.get('/registrations', listMyRegistrations);

/**
 * @openapi
 * /registrations/registrations/{id}:
 *  get:
 *    summary: Get registration by ID (for logged-in user)
 *    tags: [Registrations]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Registration ID
 *    responses: 
 *      200:
 *        description: Registration details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Registration'
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: Registration not found
 */
router.get('/registrations/:id', getMyRegistration);

/**
 * @openapi
 * /registrations/registrations/{id}:
 *  delete:
 *    summary: Delete registration by ID (for logged-in user)
 *    tags: [Registrations]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Registration ID
 *    responses: 
 *      200:
 *        description: Registration deleted successfully
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: Registration not found
 */
router.delete('/registrations/:id', removeMyRegistration);

// ========== ADMIN REGISTRATION ROUTES ==========

/**
 * @openapi
 * /registrations/admin/registrations:
 *  get:
 *    summary: Get all registrations (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: query
 *        name: page
 *        schema:
 *          type: integer
 *          minimum: 1
 *          default: 1
 *        description: Page number for pagination
 *      - in: query
 *        name: limit
 *        schema:
 *          type: integer
 *          minimum: 1
 *          maximum: 100
 *          default: 20
 *        description: Number of items per page
 *      - in: query
 *        name: sortBy
 *        schema:
 *          type: string
 *          enum: [registrationDate, createdAt, campType]
 *        description: Field to sort by
 *      - in: query
 *        name: sortOrder
 *        schema:
 *          type: string
 *          enum: [asc, desc]
 *          default: desc
 *        description: Sort order
 *    responses: 
 *      200:
 *        description: List of all registrations with pagination
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                data:
 *                  type: array
 *                  items:
 *                    $ref: '#/components/schemas/Registration'
 *                pagination:
 *                  type: object
 *                  properties:
 *                    page:
 *                      type: integer
 *                    limit:
 *                      type: integer
 *                    total:
 *                      type: integer
 *                    totalPages:
 *                      type: integer
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 */
router.get('/admin/registrations', isAdmin, validateQuery(registrationQuerySchema), listAll);

/**
 * @openapi
 * /registrations/admin/registrations/search:
 *  post:
 *    summary: Search registrations by AMKA (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            type: object
 *            required: [amka]
 *            properties:
 *              amka:
 *                type: string
 *                pattern: '^\d{11}$'
 *                example: "12345678901"
 *    responses: 
 *      200:
 *        description: Search results
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Registration'
 *      400:
 *        description: Invalid AMKA format
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 */
router.post('/admin/registrations/search', isAdmin, validate(searchAmkaSchema), searchByAmka);

/**
 * @openapi
 * /registrations/admin/registrations/{id}:
 *  put:
 *    summary: Update any registration by ID (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Registration ID
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/Registration'
 *    responses: 
 *      200:
 *        description: Registration updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Registration'
 *      400:
 *        description: Validation error
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 *      404:
 *        description: Registration not found
 */
router.put('/admin/registrations/:id', isAdmin, validate(updateRegistrationSchema), updateAny);

/**
 * @openapi
 * /registrations/admin/registrations/{id}:
 *  delete:
 *    summary: Delete any registration by ID (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Registration ID
 *    responses: 
 *      200:
 *        description: Registration deleted successfully
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 *      404:
 *        description: Registration not found
 */
router.delete('/admin/registrations/:id', isAdmin, removeAny);

/**
 * @openapi
 * /registrations/admin/registrations/{id}:
 *  get:
 *    summary: Get any registration by ID (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Registration ID
 *    responses: 
 *      200:
 *        description: Registration details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Registration'
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 *      404:
 *        description: Registration not found
 */
router.get('/admin/registrations/:id', isAdmin, getAny);

// ========== ADMIN CAMPER ROUTES ==========

/**
 * @openapi
 * /registrations/admin/campers:
 *  get:
 *    summary: Get all campers (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    responses: 
 *      200:
 *        description: List of all campers
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/Camper'
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 */
router.get('/admin/campers', isAdmin, listAllCampers);

/**
 * @openapi
 * /registrations/admin/campers/{id}:
 *  delete:
 *    summary: Delete any camper by ID (Admin only)
 *    tags: [Admin]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Camper ID
 *    responses: 
 *      200:
 *        description: Camper deleted successfully
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 *      404:
 *        description: Camper not found
 */
router.delete('/admin/campers/:id', isAdmin, removeAnyCamper);

export default router;