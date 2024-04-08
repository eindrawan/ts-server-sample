import { ObjectId } from 'mongodb';
import { z } from 'zod';

export interface UserType {
  _id?: ObjectId;
  companyId?: ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
}

export const getUserSchema = z.object({
  _id: z.string().optional().transform((v) => v ? new ObjectId(v) : v),
  name: z.string().optional().transform((v) => v ? new RegExp(v, 'i') : v),
  email: z.string().optional().transform((v) => v ? new RegExp(v, 'i') : v),
  companyId: z.string().optional().transform((v) => v ? new ObjectId(v) : v),
});

export const addUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
});
export interface AddUserInput extends z.infer<typeof addUserSchema> {}

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
export interface LoginUserInput extends z.infer<typeof loginUserSchema> {}

export const joinCompanySchema = z.object({
  companyId: z.string().transform((v) => new ObjectId(v)),
});
export interface JoinCompanyInput extends z.infer<typeof joinCompanySchema> {
  loginId: ObjectId;
}
