import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import users from './user/user.service';
import projects from './project/project.service';
import companies from './company/company.service';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    success: true,
    message: 'Athena APIv1 is running!',
  });
});

router.use('/users', users);
router.use('/projects', projects);
router.use('/companies', companies);

export default router;
