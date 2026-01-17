import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.findAllUsers();
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.findUserById(req.params.id as string);
    if (!result)
      return res.status(404).json({ message: "User not found" });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.createUser(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    if (err.message.includes('already exists')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.updateUser(req.params.id as string, req.body);
    res.status(200).json(result);
  } catch (err: any) {
    if (err.message.includes('already has this AMKA')) {
      return res.status(409).json({ message: err.message });
    }
    next(err);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.deleteUser(req.params.id as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const checkAmka = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amka } = req.body;

    if (!amka) {
      return res.status(400).json({ message: "AMKA parameter is required" });
    }

    if (!/^\d{11}$/.test(amka)) {
      return res.status(400).json({ message: "AMKA must be exactly 11 digits" });
    }

    const existingUser = await userService.findUserByAmka(amka);

    res.status(200).json({
      available: !existingUser,
      message: existingUser ? "AMKA already registered" : "AMKA available"
    });
  } catch (err) {
    next(err);
  }
};