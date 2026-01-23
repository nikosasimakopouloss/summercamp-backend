import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../validators/auth.validator";

const router = Router();

/**
 * @openapi
 * /auth/login:
 *  post:
 *    summary: Authenticate user and get JWT token
 *    tags: [Authentication]
 *    security: []
 *    requestBody:
 *      required: true
 *      content: 
 *        application/json:
 *          schema: 
 *            type: object
 *            required: [username, password]
 *            properties:
 *              username:
 *                type: string
 *                example: "john_doe"
 *              password:
 *                type: string
 *                example: "password123"
 *    responses: 
 *      200:
 *        description: Successful authentication
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                token:
 *                  type: string
 *                  description: JWT token for authenticated requests
 *                user:
 *                  $ref: '#/components/schemas/User'
 *      401:
 *        description: Invalid credentials
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Invalid Credentials"
 */
router.post('/login', validate(loginSchema), login);

export default router;