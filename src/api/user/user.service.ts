import { Router, Request, Response } from 'express';
import MessageResponse from '../../interfaces/MessageResponse';
import { getUserSchema, addUserSchema, loginUserSchema, joinCompanySchema } from './user.type';
import { User } from './user.model';
import { Company } from '../company/company.model';
import { validateData, service, authHandler } from '../../middlewares';

const router = Router();

// Users routes
router.get<{}, MessageResponse>('/', 
  authHandler, validateData(getUserSchema), 
  service(async (req: Request, res: Response) => {
    let params = req.app.get('params');
    params.companyId = params.loginCompany;
    delete params.loginId;
    delete params.loginCompany;

    const users = await User.find(params).toArray();

    res.send({
      success: true,
      data: users,
    });
  }),
);

router.post<{}, MessageResponse>('/signup', 
  validateData(addUserSchema), 
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    await User.signup(params);

    res.send({
      success: true,
      message: 'User signed up successfully',
    });
  }),
);

router.post<{}, MessageResponse>('/login', 
  validateData(loginUserSchema), 
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    const ret = await User.login(params);

    res.send({
      success: true, data: [ret],
      message: 'Login successfully',
    });  
  }),
);

router.post<{}, MessageResponse>('/join-company', 
  authHandler, validateData(joinCompanySchema), 
  service(async (req: Request, res: Response) => {
    const params = req.app.get('params');

    const company = await Company.findOne({ 
      companyId: params.companyId, 
      'employees._id': params.loginId, 
    });
    if (company && company._id?.toString() !== params.companyId) {
      throw Error('User already registered in another company');
    }

    await User.joinCompany(params.loginId, params.companyId);
    await Company.joinEmployee({ 
      _id: params.loginId, 
      companyId: params.companyId, 
      role: 'Member', 
      loginId:params.loginId }, company);

    res.send({
      success: true,
      message: 'Joined successfully',
    });  
  }),
);

export default router;