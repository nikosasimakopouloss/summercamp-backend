import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

export const list = async(req: Request, res:Response, next: NextFunction) => {
  try {
    const result = await userService.findAllUsers();
    res.status(201).json(result);
  } catch (err) {
    // next(err);
    res.status(401).json(err)
    // res.status(401).json({message:'Users not found'})
  }
}

export const getOne = async(req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.findUserById(req.params.id as string)
    if (!result) 
      return res.status(404).json({message: "User not found"})
    res.status(201).json(result);
  } catch(err){
    next(err)
  }
}

