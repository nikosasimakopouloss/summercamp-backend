import express from 'express';
import {
  list,
  getOne,
  create,
  update,
  remove,
  checkAmka
} from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createUserSchema,
  updateUserSchema,
  checkAmkaSchema
} from '../validators/user.validator';

const router = express.Router();

/**
 * @openapi
 * /users:
 *  post:
 *    summary: Create a new user
 *    tags: [Users]
 *    security: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/User'
 *    responses: 
 *      201:
 *        description: User created successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: Validation error
 *      409:
 *        description: User already exists
 */
router.post('/', validate(createUserSchema), create);

/**
 * @openapi
 * /users/check-amka:
 *  post:
 *    summary: Check if AMKA is available for registration
 *    tags: [Users]
 *    security: []
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
 */
router.post('/check-amka', validate(checkAmkaSchema), checkAmka);

router.use(authenticate);

/**
 * @openapi
 * /users:
 *  get:
 *    summary: Get all users (Admin only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    responses: 
 *      200:
 *        description: List of all users
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/User'
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 */
router.get('/', isAdmin, list);

/**
 * @openapi
 * /users/{id}:
 *  get:
 *    summary: Get user by ID
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *    responses: 
 *      200:
 *        description: User details
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: User not found
 */
router.get('/:id', getOne);

/**
 * @openapi
 * /users/{id}:
 *  put:
 *    summary: Update user by ID
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            $ref: '#/components/schemas/User'
 *    responses: 
 *      200:
 *        description: User updated successfully
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      400:
 *        description: Validation error
 *      401:
 *        description: Unauthorized - Authentication required
 *      404:
 *        description: User not found
 *      409:
 *        description: AMKA already exists
 */
router.put('/:id', validate(updateUserSchema), update);

/**
 * @openapi
 * /users/{id}:
 *  delete:
 *    summary: Delete user by ID (Admin only)
 *    tags: [Users]
 *    security:
 *      - bearerAuth: []
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *    responses: 
 *      200:
 *        description: User deleted successfully
 *      401:
 *        description: Unauthorized - Authentication required
 *      403:
 *        description: Forbidden - Admin access required
 *      404:
 *        description: User not found
 */
router.delete('/:id', isAdmin, remove);

export default router;