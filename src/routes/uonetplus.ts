import { Router, Request, Response } from 'express';
import protocol from '../utils/connection';
const router = Router();

router.get('/powiatwulkanowy/Start.mvc/Endpoints', (req: Request, res: Response) => {
  const base = protocol(req) + '://' + req.get('host') + '/powiatwulkanowy/Start.mvc';
  res.json({
    status: 'success',
    data: {
      endpoints: [
        '/GetSelfGovernments',
        '/GetStudentTrips',
        '/GetStudentConferences',
        '/GetLastNotes',
        '/GetNumberOfUnreadMessages',
        '/GetFreeDays',
        '/GetKidsLuckyNumbers',
        '/GetKidsLessonPlan',
        '/GetLastHomeworks',
        '/GetLastTests',
        '/GetLastStudentLessons',
        '/GetLastAnnouncements',
        '/GetStudentDirectorInformations',
      ].map((item) => {
        return base + item;
      }),
    },
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetSelfGovernments', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetSelfGovernments.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetStudentTrips', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetStudentTrips.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetLastNotes', async (req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus/GetLastNotes.json')).default);
});

router.all('/powiatwulkanowy/Start.mvc/GetFreeDays', async (req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus/GetFreeDays.json')).default);
});

router.all('/powiatwulkanowy/Start.mvc/GetKidsLuckyNumbers', async (req: Request, res: Response) => {
  res.json((await import('../../data/uonetplus/GetKidsLuckyNumbers.json')).default);
});

router.all('/powiatwulkanowy/Start.mvc/GetKidsLessonPlan', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetKidsLessonPlan.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetNumberOfUnreadMessages', (req: Request, res: Response) => {
  res.json({
    data: [],
    success: false,
    errorMessage: 'Not implemented yet',
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetLastHomeworks', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetLastHomeworks.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetLastTests', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetLastTests.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetStudentConferences', (req: Request, res: Response) => {
  res.json({
    data: [],
    success: false,
    errorMessage: 'Not implemented yet',
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetLastStudentLessons', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetLastStudentLessons.json')).default,
    success: true,
    errorMessage: null,
    feedback: null,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetStudentDirectorInformations', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetStudentDirectorInformations.json')).default,
    errorMessage: null,
    feedback: null,
    success: true,
  });
});

router.all('/powiatwulkanowy/Start.mvc/GetLastAnnouncements', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/uonetplus/GetLastAnnouncements.json')).default,
    errorMessage: null,
    feedback: null,
    success: true,
  });
});

router.get('/', (req: Request, res: Response) => {
  res.render('log-exception', {
    title: 'Dziennik FakeUONET+',
    message: 'Podany identyfikator klienta jest niepoprawny.',
  });
});

router.all(/^\/([a-z0-9]+)(?:\/LoginEndpoint\.aspx|\/)?$/i, (req: Request, res: Response) => {
  let hasCert = req.body.wa && req.body.wresult;

  if (req.params[0] != 'powiatwulkanowy') {
    if (hasCert)
      res.render('permission-error', {
        title: 'Logowanie',
      });
    else
      res.render('log-exception', {
        title: 'Dziennik FakeUONET+',
        message: 'Podany identyfikator klienta jest niepoprawny.',
      });

    return;
  } else if (hasCert) {
    return res.redirect('/powiatwulkanowy/Start.mvc/Index');
  }

  res.redirect(
    protocol(req) + '://' + req.get('host')!.replace('uonetplus', 'cufs') + '/powiatwulkanowy/Account/LogOn'
  );
});

router.get(['/powiatwulkanowy/Start.mvc', '/powiatwulkanowy/Start.mvc/Index'], (req: Request, res: Response) => {
  res.render('homepage', {
    title: 'Uonet+',
    uonetplusOpiekun: protocol(req) + '://' + req.get('host')!.replace('uonetplus', 'uonetplus-opiekun'),
    uonetplusUczen: protocol(req) + '://' + req.get('host')!.replace('uonetplus', 'uonetplus-uczen'),
    uonetplusUczenplus: protocol(req) + '://' + req.get('host')!.replace('uonetplus', 'uonetplus-uczenplus'),
    uonetplusWiadomosciplus: protocol(req) + '://' + req.get('host')!.replace('uonetplus', 'uonetplus-wiadomosciplus'),
  });
});

export default router;
