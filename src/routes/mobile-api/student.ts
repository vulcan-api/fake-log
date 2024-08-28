import { Request, Response, Router } from 'express';
import { addDays, differenceInDays, getTime, parseISO, startOfWeek } from 'date-fns';
import api from '../../utils/api';
import converter from '../../utils/converter';

const router = Router({});

router.all('/LogAppStart', (req: Request, res: Response) => {
  res.json(api.createResponse('Log'));
});

router.all('/UstawPushToken', (req: Request, res: Response) => {
  res.json(api.createResponse('Zapisano tokenId dla powiadomien PUSH'));
});

router.all('/Slowniki', async (req: Request, res: Response) => {
  res.json(
    api.createResponse({
      TimeKey: Math.round(new Date().getTime() / 1000),
      Nauczyciele: await import('../../../data/api/dictionaries/Nauczyciele.json'),
      Pracownicy: await import('../../../data/api/dictionaries/Pracownicy.json'),
      Przedmioty: await import('../../../data/api/dictionaries/Przedmioty.json'),
      PoryLekcji: await import('../../../data/api/dictionaries/PoryLekcji.json'),
      KategorieOcen: await import('../../../data/api/dictionaries/KategorieOcen.json'),
      KategorieUwag: await import('../../../data/api/dictionaries/KategorieUwag.json'),
      KategorieFrekwencji: await import('../../../data/api/dictionaries/KategorieFrekwencji.json'),
      TypyFrekwencji: await import('../../../data/api/dictionaries/TypyFrekwencji.json'),
    })
  );
});

router.all('/PlanLekcjiZeZmianami', async (req: Request, res: Response) => {
  const timetable = (await import('../../../data/api/student/PlanLekcjiZeZmianami.json')).default;
  const requestDate = req.body.DataPoczatkowa
    ? parseISO(req.body.DataPoczatkowa)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const baseOffset = differenceInDays(requestDate, parseISO(timetable[0].DzienTekst));

  res.json(
    api.createResponse(
      timetable.map((item: { DzienTekst: string }) => {
        const date = addDays(parseISO(item.DzienTekst), baseOffset);
        return {
          ...item,
          Dzien: getTime(date) / 1000,
          DzienTekst: converter.formatDate(date, true),
        };
      })
    )
  );
});

router.all('/Oceny', async (req: Request, res: Response) => {
  res.json(api.createResponse(await import('../../../data/api/student/Oceny.json')));
});

router.all('/OcenyPodsumowanie', async (req: Request, res: Response) => {
  res.json(api.createResponse(await import('../../../data/api/student/OcenyPodsumowanie.json')));
});

router.all('/Sprawdziany', async (req: Request, res: Response) => {
  const exams = (await import('../../../data/api/student/Sprawdziany.json')).default;
  const requestDate = req.body.DataPoczatkowa
    ? parseISO(req.body.DataPoczatkowa)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const baseOffset = differenceInDays(requestDate, parseISO(exams[0].DataTekst));

  res.json(
    api.createResponse(
      exams.map((item: { DataTekst: string }) => {
        const date = addDays(parseISO(item.DataTekst), baseOffset);
        return {
          ...item,
          Data: getTime(date) / 1000,
          DataTekst: converter.formatDate(date, true),
        };
      })
    )
  );
});

router.all('/UwagiUcznia', async (req: Request, res: Response) => {
  res.json(api.createResponse((await import('../../../data/api/student/UwagiUcznia.json')).default));
});

router.all('/Frekwencje', async (req: Request, res: Response) => {
  const attendance = (await import('../../../data/api/student/Frekwencje.json')).default;
  const requestDate = req.body.DataPoczatkowa
    ? parseISO(req.body.DataPoczatkowa)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const baseOffset = differenceInDays(requestDate, parseISO(attendance[0].DzienTekst));

  res.json(
    api.createResponse({
      DataPoczatkowa: 1524434400,
      DataKoncowa: 1525039199,
      DataPoczatkowaTekst: req.body.DataPoczatkowa,
      DataKoncowaTekst: req.body.DataKoncowa,
      Frekwencje: attendance.map((item: { DzienTekst: string }) => {
        const date = addDays(parseISO(item.DzienTekst), baseOffset);
        return {
          ...item,
          Dzien: getTime(date) / 1000,
          DzienTekst: converter.formatDate(date, true),
        };
      }),
    })
  );
});

router.all('/ZadaniaDomowe', async (req: Request, res: Response) => {
  const homework = (await import('../../../data/api/student/ZadaniaDomowe.json')).default;
  const requestDate = req.body.DataPoczatkowa
    ? parseISO(req.body.DataPoczatkowa)
    : startOfWeek(new Date(), { weekStartsOn: 1 });
  const baseOffset = differenceInDays(requestDate, parseISO(homework[0].DataTekst));

  res.json(
    api.createResponse(
      homework.map((item: { DataTekst: string }) => {
        const date = addDays(parseISO(item.DataTekst), baseOffset);
        return {
          ...item,
          Data: getTime(date) / 1000,
          DataTekst: converter.formatDate(date, true),
        };
      })
    )
  );
});

router.all('/Nauczyciele', async (req: Request, res: Response) => {
  res.json(api.createResponse(await import('../../../data/api/student/Nauczyciele.json')));
});

export default router;
