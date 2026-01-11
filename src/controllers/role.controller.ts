import { Request, Response, NextFunction } from "express";
import *  as RoleService from '../services/role.service';


export const list = async (req: Request, res: Response, next: NextFunction)=> {
try {

  const result = await RoleService.findAllRoles();
  res.status(200).json(result);
} catch(err) {
  next(err);
  }
}