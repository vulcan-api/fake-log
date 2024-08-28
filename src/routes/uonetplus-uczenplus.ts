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

router.all('/api/Context', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Context.json')).default);
});

router.all('/api/Cache', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Cache.json')).default);
});

router.all('/api/OkresyKlasyfikacyjne', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/OkresyKlasyfikacyjne.json')).default);
});

router.all('/api/Zebrania', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Zebrania.json')).default);
});

router.all('/api/SprawdzianyZadaniaDomowe', async (_req: Request, res: Response) => {
  res.json(
    (await import('../../data/uonetplus-uczenplus/SprawdzianyZadaniaDomowe.json')).default.map((event) => {
      event.data = new Date().toISOString();
      return event;
    })
  );
});

router.all('/api/SprawdzianSzczegoly', async (_req: Request, res: Response) => {
  const data = (await import('../../data/uonetplus-uczenplus/SprawdzianSzczegoly.json')).default;
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/api/ZadanieDomoweSzczegoly', async (_req: Request, res: Response) => {
  const data = (await import('../../data/uonetplus-uczenplus/ZadanieDomoweSzczegoly.json')).default;
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/api/Oceny', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Oceny.json')).default);
});

router.all('/api/Frekwencja', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Frekwencja.json')).default);
});

router.all('/api/Uwagi', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Uwagi.json')).default);
});

router.all('/api/Nauczyciele', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Nauczyciele.json')).default);
});

router.all('/api/Informacje', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/Informacje.json')).default);
});

router.all('/api/WiadomosciNieodczytane', (_req: Request, res: Response) => {
  res.json({ liczbaNieodczytanychWiadomosci: 2 });
});

router.all('/api/DostepOffice', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/DostepOffice.json')).default);
});

router.all('/api/ZarejestrowaneUrzadzenia', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/ZarejestrowaneUrzadzenia.json')).default);
});

router.all('/api/PodrecznikiLataSzkolne', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/PodrecznikiLataSzkolne.json')).default);
});

router.all('/api/SzczesliwyNumerTablica', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/SzczesliwyNumerTablica.json')).default);
});

router.all('/api/WazneDzisiajTablica', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/WazneDzisiajTablica.json')).default);
});

router.all('/api/WychowawcyTablica', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/WychowawcyTablica.json')).default);
});

router.all('/api/RealizacjaZajec', async (_req: Request, res: Response) => {
  res.json(
    (await import('../../data/uonetplus-uczenplus/RealizacjaZajec.json')).default.map((lesson) => {
      lesson.data = new Date().toISOString();
      return lesson;
    })
  );
});

router.all('/api/PlanZajec', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/PlanZajec.json')).default);
});

router.all('/api/DniWolne', async (_req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus-uczenplus/DniWolne.json')).default);
});

router.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).send({ message: 'Nie odnaleziono zasobu.' });
});

export default router;
