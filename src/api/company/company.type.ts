import { ObjectId } from 'mongodb';
import { z } from 'zod';

export interface CompanyType {
  _id?: ObjectId
  name: string
  employees: EmployeeType[]
  workspaces: WorkspaceType[]
  createdAt: Date
  createdBy: ObjectId
  updatedAt?: Date
  updatedBy?: ObjectId
}

export interface EmployeeType {
  _id?: ObjectId
  role: 'Owner' | 'Admin' | 'Member',
  createdAt: Date
  createdBy: ObjectId
}

export interface WorkspaceType {
  _id?: ObjectId
  name: string
  projects: ObjectId[]
  createdAt: Date
  createdBy: ObjectId
}

export const createCompanySchema = z.object({
  name: z.string(),
});
export interface CreateCompanyInput extends z.infer<typeof createCompanySchema> {
  loginId: ObjectId
}

export const addWorkspaceSchema = z.object({
  companyId: z.string().transform((v) => new ObjectId(v)),
  name: z.string(),
});
export interface AddWorkspaceInput extends z.infer<typeof addWorkspaceSchema> {
  loginId: ObjectId
}

export const addEmployeeSchema = z.object({
  companyId: z.string().transform((v) => new ObjectId(v)),
  _id: z.string().transform((v) => new ObjectId(v)),
  role: z.string()
    .regex(/^(Owner|Admin|Member)$/, 'Role can only be either Owner, Admin or Member')
    .transform((v) => v as 'Owner' | 'Admin' | 'Member'),
});
export interface AddEmployeeInput extends z.infer<typeof addEmployeeSchema> {
  loginId: ObjectId
}