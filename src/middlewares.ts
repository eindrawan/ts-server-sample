import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { ObjectId } from 'mongodb';
import ErrorResponse from './interfaces/ErrorResponse';
import MessageResponse from './interfaces/MessageResponse';
import jwt from 'jsonwebtoken';

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

export const authHandler = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.SECRET || '');
      
      if (!decoded) throw new Error('Unauthorized');
      req.app.set('user', decoded);
    } else {
      throw new Error('Unauthorized');
    }
    next();
  } catch (error) {
    return next(error);
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  // convert to human friendly error
  let errMsg = err.message;
  if (errMsg.match(/duplicate key error collection/)) 
    errMsg = errMsg.replace(/^[^{]+/, 'Duplicate data ');

  res.json({
    success: false,
    message: errMsg,
    stack: ['production', 'test'].includes(process.env.NODE_ENV || '') ? '-' : err.stack,
  });
}

export function validateData(schema: z.ZodObject<any, any>) {
  return (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
    try {
      const user = req.app.get('user');
      let loginId = null;
      let loginCompany = null;
      if (user) {
        loginId = new ObjectId(user.userId);
        loginCompany = new ObjectId(user.companyId);
      }
      if (req.method === 'GET') {
        const vals = schema.parse(req.query);        
        req.app.set('params', { ...vals, loginId, loginCompany });
      } else {
        const vals = schema.parse(req.body);
        req.app.set('params', { ...vals, loginId, loginCompany });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          field: issue.path.join('.'),
          errorType: issue.message,
          errorMessage: `${issue.path.join('.')} is ${issue.message}`,
        }));
        res.status(400).json({ success:false, message: 'Invalid data', data: errorMessages });
      } else {
        res.status(500).json({ success:false, message: 'Internal Server Error' });
      }
    }
  };
}

export const service = (controller: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await controller(req, res);
  } catch (error) {
    return next(error);
  }
};
