import { Router, Response, Request } from 'express';
import api from '../../utils/api';

const router = Router({});

router.all('/GetCertificatePushConfig', (req: Request, res: Response) => {
  res.json(api.createResponse('not implemented')); //TODO
});

export default router;
