import { Request, Response, Router } from 'express';
import protocol from '../utils/connection';
const router = Router();

/* GET home page. */
router.get('/', (req: Request, res: Response) => {
  res.render('index', {
    title: 'fake-log',
    proto: protocol(req),
    domain: req.get('host'),
  });
});

export default router;
