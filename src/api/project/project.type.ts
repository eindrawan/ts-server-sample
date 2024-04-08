import { ObjectId } from 'mongodb';
import { z } from 'zod';

export interface ProjectType {
  _id?: ObjectId
  workspaceId?: ObjectId
  name: string
  description: string
  jiraUrl: string
  priority: 'Low' | 'Medium' | 'High'
  status: string
  milestones: Milestone[]
  members: ProjectMember[]
  createdAt: Date
  createdBy: ObjectId
  updatedAt?: Date
  updatedBy?: ObjectId
}

export interface ProjectMember {
  _id?: ObjectId
  role: 'Owner' | 'Admin' | 'Member',
  createdAt: Date
  createdBy: ObjectId
}

export interface Milestone {
  _id?: ObjectId
  name: string
  status: string
  startDate: Date
  endDate: Date
  createdAt: Date
  createdBy: ObjectId
  updatedAt?: Date
  updatedBy?: ObjectId
}

export const getProjectSchema = z.object({
  _id: z.string().optional().transform((v) => v ? new ObjectId(v) : v),
  workspaceId: z.string().optional().transform((v) => v ? new ObjectId(v) : v),
  userId: z.string().optional().transform((v) => v ? new ObjectId(v) : v),
});
export interface GetProjectInput extends z.infer<typeof getProjectSchema> {}

export const importProjectSchema = z.object({
  workspaceId: z.string().transform((v) => new ObjectId(v)),
  url: z.string(),
});
export interface ImportProjectInput extends z.infer<typeof importProjectSchema> {
  loginId: ObjectId
}

export const addMilestoneSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  status: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export interface AddMilestoneInput extends z.infer<typeof addMilestoneSchema> {
  loginId: ObjectId
}

export const addMemberSchema = z.object({
  projectId: z.string(),
  _id: z.string().transform((v) => new ObjectId(v)),
  role: z.string()
    .regex(/^(Owner|Admin|Member)$/, 'Role can only be either Owner, Admin or Member')
    .transform((v) => v as 'Owner' | 'Admin' | 'Member'),
});
export interface AddMemberInput extends z.infer<typeof addMemberSchema> {
  loginId: ObjectId
}