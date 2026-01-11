import { Request, Response, NextFunction } from "express";
import *  as roleService from '../services/role.service';


export const list = async (req: Request, res: Response, next: NextFunction)=> {
try {

  const result = await roleService.findAllRoles();
  res.status(200).json(result);
} catch(err) {
  next(err);
  }
}




export const create = async (req: Request, res: Response, next: NextFunction)=> {
try {
   console.log(">>", req.body);
  const result = await roleService.createRole(req.body);
  res.status(200).json(result);
} catch(err) {
  next(err);
  }
}




