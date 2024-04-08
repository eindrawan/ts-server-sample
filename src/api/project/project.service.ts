import { Router, Request, Response } from 'express';
import MessageResponse from '../../interfaces/MessageResponse';
import { addMilestoneSchema, getProjectSchema, importProjectSchema } from './project.type';
import { Project } from './project.model';
import { Workspace } from '../company/company.model';
import { authHandler, service, validateData } from '../../middlewares';
import { ObjectId } from 'mongodb';

const router = Router();

// Project routes
// Get List of Projects
router.get<{}, MessageResponse>('/', 
  authHandler, validateData(getProjectSchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    let filter:Record<string, any> = {};
    // only get projects that he has the access
    let userIds = [params.loginId];
    if (params.userId) userIds.push(params.userId);
    filter['members._id'] = { $all: userIds };

    if (params.workspaceId) {
      filter.workspaceId = params.workspaceId;
    }
    
    const projects = await Project.find(filter).toArray();

    res.send({
      success: true,
      data: projects,
    });
  }),
);

// Import Project from JIRA Epic
router.post<{}, MessageResponse>('/import-jira', 
  authHandler, validateData(importProjectSchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');
    
    const projects = await Project.importFromJira(params);
    const projectIds = projects.map(p => ({ _id:p._id as ObjectId }));
    await Workspace.includeProjects(params.workspaceId, projectIds);
    
    res.send({
      success: true,
      data: projectIds,
      message: 'Projects imported successfully',
    });
  }),
);

// Milestone routes
// Add Milestones
router.put<{}, MessageResponse>('/milestones', 
  authHandler, validateData(addMilestoneSchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');
    
    await Project.addMilestone(params);

    res.send({
      success: true,
      message: 'Milestone added successfully',
    });
  }),
);

// Member routes
// Add Member
router.put<{}, MessageResponse>('/members', 
  authHandler, validateData(addMilestoneSchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');
    
    await Project.addMember(params);

    res.send({
      success: true,
      message: 'Project Member added successfully',
    });
  }),
);

export default router;