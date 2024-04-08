import { Router, Request, Response } from 'express';
import MessageResponse from '../../interfaces/MessageResponse';
import { addWorkspaceSchema, createCompanySchema } from './company.type';
import { Company } from './company.model';
import { User } from '../user/user.model';
import { authHandler, service, validateData } from '../../middlewares';

// Company routes
const router = Router();

// Create Company
router.put<{}, MessageResponse>('/', 
  authHandler, validateData(createCompanySchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    const companyId = await Company.create(params);
    await User.joinCompany(params.loginId, companyId);

    res.send({
      success: true,
      data: [{ _id: companyId }],
      message: 'Company created successfully',
    });
  }),
);

// Add Workspace
router.put<{}, MessageResponse>('/workspaces', 
  authHandler, validateData(addWorkspaceSchema),
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    const workspaceId = await Company.addWorkspace(params);

    res.send({
      success: true,
      data: [{ _id: workspaceId }],
      message: 'Workspace added successfully',
    });
  }),
);

export default router;