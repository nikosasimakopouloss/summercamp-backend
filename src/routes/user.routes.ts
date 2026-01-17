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

router.post('/', validate(createUserSchema), create);
router.post('/check-amka', validate(checkAmkaSchema), checkAmka);

router.use(authenticate);

router.get('/', isAdmin, list);
router.get('/:id', getOne);
router.put('/:id', validate(updateUserSchema), update);
router.delete('/:id', isAdmin, remove);

export default router;