import { Request, Response, Router } from 'express';
import fs from 'fs';
import protocol from '../utils/connection';

const router = Router();
router.get('/', (req: Request, res: Response) => {
  res.redirect('/powiatwulkanowy/Account/LogOn');
});

router.get('/powiatwulkanowy(/)?', (req: Request, res: Response) => {
  res.redirect('/powiatwulkanowy/Account/LogOn');
});

// GET login page
router.get('/:symbol/Account/LogOn', (req: Request, res: Response) => {
  res.render('login-form', {
    title: 'Logowanie (' + req.param('symbol') + ')',
  });
});

// POST login
router.post('/:symbol/Account/LogOn', (req: Request, res: Response) => {
  if ('jan@fakelog.cf' === req.body.LoginName && 'jan123' === req.body.Password) {
    res.cookie('Vulcan.CUFS.WebFrontEndCookie', '1234567891012131314151617181920212223242526+');
    res.cookie('ARR_cufs.vulcan.net.pl', '1234567891012131314151617181920212223242526272829303132333435363');
    return res.redirect(
      '/' +
        req.param('symbol') +
        '/FS/LS?' +
        'wa=wsignin1.0&' +
        'wtrealm=' +
        protocol(req) +
        '%3a%2f%2fuonetplus.fakelog.localhost%3A300%2f' +
        req.param('symbol') +
        '%2fLoginEndpoint.aspx&' +
        'wctx=' +
        protocol(req) +
        '%3a%2f%2fuonetplus.fakelog.localhost%3A300%2f' +
        req.param('symbol') +
        '%2fLoginEndpoint.aspx'
    );
  }

  res.render('login-form', {
    title: 'Logowanie (' + req.param('symbol') + ')',
    message: 'Zła nazwa użytkownika lub hasło',
  });
});

router.get('/:symbol/FS/LS', (req: Request, res: Response) => {
  res.render('login-cert', {
    symbol: req.param('symbol'),
    cert: fs.readFileSync('public/cert.xml', 'utf8'),
    uonetplusOpiekun: protocol(req) + '://' + req.get('host')!.replace('cufs.', 'uonetplus.'),
  });
});

router.get('/:symbol/AccountManage/UnlockAccount', (req: Request, res: Response) => {
  res.render('login-recover', { title: 'Przywracanie dostępu' });
});

router.post('/:symbol/AccountManage/UnlockAccount', (req: Request, res: Response) => {
  if (req.body['g-recaptcha-response']) {
    return res.render('summary', { title: 'Podsumowanie operacji' });
  }

  res.render('login-recover', {
    title: 'Przywracanie dostępu',
    message:
      'Mechanizm zabezpieczający przeciw robotom i robakom internetowym sygnalizuje, że żądanie nie zostało poprawnie autoryzowane',
  });
});

export default router;
