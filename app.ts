import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';
import path from 'path';
import protocol from './src/utils/connection';
import subdomain from 'express-subdomain';
import api from './src/routes/api';
import cufs from './src/routes/cufs';
import index from './src/routes/index';
import uonetplus from './src/routes/uonetplus';
import uonetplusOpiekun from './src/routes/uonetplus-opiekun';
import uonetplusUczen from './src/routes/uonetplus-uczen';
import uonetplusUczenplus from './src/routes/uonetplus-uczenplus/index';
import uonetplusUzytkownik from './src/routes/uonetplus-uzytkownik';
import uonetplusWiadomosciplus from './src/routes/uonetplus-wiadomosciplus';

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req: Request, res: Response, next: NextFunction) => {
  res.locals.userInfo = (await import('./data/api/ListaUczniow.json')).default[1];
  res.locals.uonetplusUrl = protocol(req) + '://' + req.get('host')!.replace('uonetplus-opiekun', 'uonetplus');
  res.locals.currentHost = protocol(req) + '://' + req.get('host');
  res.locals.proto = protocol(req);
  res.locals.host = req.get('host')!.replace(/(api|cufs|uonetplus|uonetplus-opiekun|uonetplus-uzytkownik)\./, '');
  res.cookie('UonetPlus_ASP.NET_SessionId', '', {
    httpOnly: true,
    domain: req.get('host'),
  });
  res.cookie('ARR_DS_ARR301302', '', {
    httpOnly: true,
    domain: req.get('host'),
  });
  res.cookie('ARR_' + req.get('host'), '1234567891012131314151617181920212223242526272829303132333435363', {
    httpOnly: true,
    domain: req.get('host'),
  });
  next();
});

const corsOpt = {
  origin: process.env.CORS_ALLOW_ORIGIN || '*',
};
app.use(cors(corsOpt));
app.options('*', cors(corsOpt));

app.set('subdomain offset', +process.env.SUBDOMAIN_OFFSET! || 2);
app.use(subdomain('api', api));
app.use(subdomain('cufs', cufs));
app.use(subdomain('uonetplus', uonetplus));
app.use(subdomain('uonetplus-opiekun', uonetplusOpiekun.use('/powiatwulkanowy/123456', uonetplusOpiekun)));
app.use(subdomain('uonetplus-opiekun', uonetplusOpiekun.use('/powiatwulkanowy/123457', uonetplusOpiekun)));
app.use(subdomain('uonetplus-opiekun', uonetplusOpiekun.use('/powiatwulkanowy/123458', uonetplusOpiekun)));
app.use(subdomain('uonetplus-uczen', uonetplusUczen.use('/powiatwulkanowy/:customerSymbol', uonetplusUczen)));
app.use(
  subdomain('uonetplus-uczenplus', uonetplusUczenplus.use('/powiatwulkanowy/:customerSymbol', uonetplusUczenplus))
);
app.use(subdomain('uonetplus-uzytkownik', uonetplusUzytkownik.use('/powiatwulkanowy', uonetplusUzytkownik)));
app.use(
  subdomain('uonetplus-wiadomosciplus', uonetplusWiadomosciplus.use('/powiatwulkanowy', uonetplusWiadomosciplus))
);
app.use('/', index);

// Introduce a custom HttpError class to handle HTTP errors with a status code
class HttpError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
// catch 404 and forward to error handler
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new HttpError('Not Found', 404);
  err.status = 404;
  next(err);
});

// error handler
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

if (typeof (global as any).PhusionPassenger !== 'undefined') {
  // Assuming that the PhusionPassenger variable is likely to be declared in the production stage automatically
  app.listen('passenger');
}

export default app;
