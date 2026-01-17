// import { Request, Response, NextFunction } from "express";
// import { ZodSchema } from "zod";

// export const validate = (schema:ZodSchema<any>) => (req:Request, res: Response, next: NextFunction) => {
//   try {
//     const toValidate = {
//       body: req.body,
//       query: req.query,
//       params: req.params
//     }
//     schema.parse(toValidate.body);
//     next();
//   } catch (err) {
//     return res.status(400).json({message:"Problem in form data", error: err});
//   }
// }


import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Validation error",
      error: err
    });
  }
};

export const validateQuery = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.query);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Query validation error",
      error:  err
    });
  }
};

export const validateParams = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.params);
    next();
  } catch (err) {
    return res.status(400).json({
      message: "Parameters validation error",
      error : err
    });
  }
};


