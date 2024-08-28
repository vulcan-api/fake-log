import { format, getTime } from 'date-fns';
import { Router, Response, Request } from 'express';
import { createEnvelope } from './utils';

const router = Router({});

router.all('/version', (req: Request, res: Response) => {
  res.json(createEnvelope(105, 'Podany czas jest nieprawidłowy', 'Object', null));
});

router.all('/internal/time', (req: Request, res: Response) => {
  res.json(
    createEnvelope(0, 'OK', 'DateInfoPayload', {
      Date: format(new Date(), 'yyyy-MM-dd'),
      DateDisplay: format(new Date(), 'dd.MM.yyyy'),
      Time: format(new Date(), 'HH:mm:ss'),
      Timestamp: getTime(new Date()),
    })
  );
});

router.all('/heartbeat', (req: Request, res: Response) => {
  res.json(createEnvelope(0, 'OK', 'Boolean', true));
});

export default router;
