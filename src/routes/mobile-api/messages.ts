import { Router, Response, Request } from 'express';
import { createResponse } from '../../utils/api';

const router = Router({});

router.all('/ZmienStatusWiadomosci', (req: Request, res: Response) => {
  res.json(createResponse('Zmiana statusu wiadomości'));
});

router.all('/WiadomosciOdebrane', async (req: Request, res: Response) => {
  res.json(createResponse(await import('../../../data/api/messages/WiadomosciOdebrane.json')));
});

router.all('/WiadomosciWyslane', async (req: Request, res: Response) => {
  res.json(createResponse(await import('../../../data/api/messages/WiadomosciWyslane.json')));
});

router.all('/WiadomosciUsuniete', async (req: Request, res: Response) => {
  res.json(createResponse(await import('../../../data/api/messages/WiadomosciUsuniete.json')));
});

router.all('/DodajWiadomosc', async (req: Request, res: Response) => {
  res.json(createResponse(await import('../../../data/api/messages/DodajWiadomosc.json')));
});

export default router;
