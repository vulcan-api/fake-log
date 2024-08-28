import { Router } from 'express';
import assignments from '../../../data/uonetplus-uczenplus/SprawdzianyZadaniaDomowe.json';

const router = Router({ mergeParams: true });

router.use((req, res, next) => {
  if (req.params.customerSymbol !== '123456') res.status(409).json({ message: 'Brak uprawnień.' });
  next();
});

router.all('/Context', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Context.json'));
});

router.all('/Cache', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Cache.json'));
});

router.all('/OkresyKlasyfikacyjne', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/OkresyKlasyfikacyjne.json'));
});

router.all('/Zebrania', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Zebrania.json'));
});

router.all('/SprawdzianyZadaniaDomowe', (_req, res) => {
  res.json(
    assignments.map((event) => {
      event.data = new Date().toISOString();
      return event;
    })
  );
});

router.all('/SprawdzianSzczegoly', async (_req, res) => {
  const data = await import('../../../data/uonetplus-uczenplus/SprawdzianSzczegoly.json');
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/ZadanieDomoweSzczegoly', async (_req, res) => {
  const data = await import('../../../data/uonetplus-uczenplus/ZadanieDomoweSzczegoly.json');
  data.data = new Date().toISOString();
  res.json(data);
});

router.all('/Oceny', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Oceny.json'));
});

router.all('/Frekwencja', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Frekwencja.json'));
});

router.all('/FrekwencjaStatystyki', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/FrekwencjaStatystyki.json'));
});

router.all('/Usprawiedliwienia', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Usprawiedliwienia.json'));
});

router.all('/Uwagi', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Uwagi.json'));
});

router.all('/Nauczyciele', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Nauczyciele.json'));
});

router.all('/Informacje', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/Informacje.json'));
});

router.all('/WiadomosciNieodczytane', (_req, res) => {
  res.json({ liczbaNieodczytanychWiadomosci: 2 });
});

router.all('/DostepOffice', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/DostepOffice.json'));
});

router.all('/ZarejestrowaneUrzadzenia', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/ZarejestrowaneUrzadzenia.json'));
});

router.all('/PodrecznikiLataSzkolne', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/PodrecznikiLataSzkolne.json'));
});

router.all('/SzczesliwyNumerTablica', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/SzczesliwyNumerTablica.json'));
});

router.all('/WazneDzisiajTablica', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/WazneDzisiajTablica.json'));
});

router.all('/WychowawcyTablica', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/WychowawcyTablica.json'));
});

router.all('/RealizacjaZajec', async (_req, res) => {
  const lessons = await import('../../../data/uonetplus-uczenplus/RealizacjaZajec.json');
  res.json(
    lessons.map((lesson) => {
      lesson.data = new Date().toISOString();
      return lesson;
    })
  );
});

router.all('/PlanZajec', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/PlanZajec.json'));
});

router.all('/DniWolne', async (_req, res) => {
  res.json(await import('../../../data/uonetplus-uczenplus/DniWolne.json'));
});

router.all('/*', (_req, res) => {
  res.status(404).send({ message: 'Nie odnaleziono zasobu.' });
});

export default router;
