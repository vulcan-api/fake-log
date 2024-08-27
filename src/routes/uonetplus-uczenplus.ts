import { Request, Response, Router } from 'express';
import protocol from '../utils/connection';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const base = protocol(req) + '://' + req.get('host') + '/powiatwulkanowy/123456';
  res.json({
    loginEndpoint: base + '/LoginEndpoint.aspx',
    app: base + '/App',
    api: [
      base + '/api/Context',
      base + '/api/Cache',
      base + '/api/OkresyKlasyfikacyjne',
      base + '/api/Zebrania',
      base + '/api/SprawdzianyZadaniaDomowe',
      base + '/api/SprawdzianSzczegoly',
      base + '/api/ZadanieDomoweSzczegoly',
      base + '/api/Uwagi',
      base + '/api/Frekwencja',
      base + '/api/Oceny',
      base + '/api/Nauczyciele',
      base + '/api/Informacje',
      base + '/api/NieprzeczytaneWiadomosci',
      base + '/api/DostepOffice',
      base + '/api/ZarejestrowaneUrzadzenia',
      base + '/api/PodrecznikiLataSzkolne',
      base + '/api/SzczesliwyNumerTablica',
      base + '/api/WazneDzisiajTablica',
      base + '/api/WychowawcyTablica',
      base + '/api/RealizacjaZajec',
      base + '/api/PlanZajec',
      base + '/api/DniWolne',
    ].sort(),
  });
});

router.all('/LoginEndpoint.aspx', (req: Request, res: Response) => {
  res.redirect(protocol(req) + '://' + req.get('host') + '/powiatwulkanowy/123456/App');
});

router.all('/App', (_req: Request, res: Response) => {
  res.render('uczenplus/app');
});

router.all('/api/Context', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Context.json'));
});

router.all('/api/Cache', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Cache.json'));
});

router.all('/api/OkresyKlasyfikacyjne', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/OkresyKlasyfikacyjne.json'));
});

router.all('/api/Zebrania', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Zebrania.json'));
});

router.all('/api/SprawdzianyZadaniaDomowe', async (_req: Request, res: Response) => {
  res.json(
    (await import('../../data/uonetplus-uczenplus/SprawdzianyZadaniaDomowe.json')).default.map((event) => {
      event.data = new Date().toISOString();
      return event;
    })
  );
});

router.all('/api/SprawdzianSzczegoly', (_req: Request, res: Response) => {
  const data = require('../../data/uonetplus-uczenplus/SprawdzianSzczegoly.json');
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/api/ZadanieDomoweSzczegoly', (_req: Request, res: Response) => {
  const data = require('../../data/uonetplus-uczenplus/ZadanieDomoweSzczegoly.json');
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/api/Oceny', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Oceny.json'));
});

router.all('/api/Frekwencja', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Frekwencja.json'));
});

router.all('/api/Uwagi', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Uwagi.json'));
});

router.all('/api/Nauczyciele', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Nauczyciele.json'));
});

router.all('/api/Informacje', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/Informacje.json'));
});

router.all('/api/WiadomosciNieodczytane', (_req: Request, res: Response) => {
  res.json({ liczbaNieodczytanychWiadomosci: 2 });
});

router.all('/api/DostepOffice', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/DostepOffice.json'));
});

router.all('/api/ZarejestrowaneUrzadzenia', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/ZarejestrowaneUrzadzenia.json'));
});

router.all('/api/PodrecznikiLataSzkolne', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/PodrecznikiLataSzkolne.json'));
});

router.all('/api/SzczesliwyNumerTablica', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/SzczesliwyNumerTablica.json'));
});

router.all('/api/WazneDzisiajTablica', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/WazneDzisiajTablica.json'));
});

router.all('/api/WychowawcyTablica', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/WychowawcyTablica.json'));
});

router.all('/api/RealizacjaZajec', async (_req: Request, res: Response) => {
  res.json(
    (await import('../../data/uonetplus-uczenplus/RealizacjaZajec.json')).default.map((lesson) => {
      lesson.data = new Date().toISOString();
      return lesson;
    })
  );
});

router.all('/api/PlanZajec', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/PlanZajec.json'));
});

router.all('/api/DniWolne', (_req: Request, res: Response) => {
  res.json(require('../../data/uonetplus-uczenplus/DniWolne.json'));
});

router.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).send({ message: 'Nie odnaleziono zasobu.' });
});

export default router;
