import { Router, Request, Response } from 'express';
import protocol from '../utils/connection';
// import { timestampToIsoTzFormat, dateToTimestamp } from '../utils/converter';
import converter from '../utils/converter';
import { fromString } from 'uuidv4';

const router = Router();
router.get('/', (req: Request, res: Response) => {
  res.render('messages');
});

router.get('/LoginEndpoint.aspx', (req: Request, res: Response) => {
  res.redirect('/');
});

router.get('/-endpoints', (req: Request, res: Response) => {
  const base = protocol(req) + '://' + req.get('host') + '/powiatwulkanowy';
  res.json({
    status: 'sucess',
    data: {
      endpoints: [
        '/api/Skrzynki',
        '/api/Pracownicy',
        '/api/Odebrane',
        '/api/OdebraneSkrzynka',
        '/api/Wyslane',
        '/api/WyslaneSkrzynka',
        '/api/Usuniete',
        '/api/UsunieteSkrzynka',
        '/api/WiadomoscSzczegoly',
        '/api/WiadomoscOdpowiedzPrzekaz',
        '/api/WiadomoscNowa',
        '/api/MoveTrash',
        '/api/Delete',
      ].map((item) => {
        return base + item;
      }),
    },
  });
});

router.get(['/api/Odebrane', '/api/OdebraneSkrzynka'], async (req: Request, res: Response) => {
  const currentTimestamp = converter.dateToTimestamp(new Date());
  res.json(
    (await import('../../data/api/messages/WiadomosciOdebrane.json')).map((item, i) => {
      let itemTimestamp = item.DataWyslaniaUnixEpoch;
      if (i < 7) {
        itemTimestamp = currentTimestamp - i * i * 3600 * 6;
      }
      return {
        apiGlobalKey: fromString(item.WiadomoscId.toString()),
        korespondenci: item.Nadawca + ' - P - (Fake123456)',
        temat: item.Tytul,
        data: converter.timestampToIsoTzFormat(itemTimestamp),
        skrzynka: 'Jan Kowalski - U - (Fake123456)',
        hasZalaczniki: true,
        przeczytana: !!item.GodzinaPrzeczytania,
        nieprzeczytanePrzeczytanePrzez: null,
        wazna: false,
        uzytkownikRola: 2,
        id: item.WiadomoscId,
      };
    })
  );
});

router.get(['/api/Wyslane', '/api/WyslaneSkrzynka'], async (req: Request, res: Response) => {
  res.json(
    (await import('../../data/api/messages/WiadomosciWyslane.json')).default.map((item) => {
      return {
        apiGlobalKey: fromString(item.WiadomoscId.toString()),
        korespondenci: item.Nadawca + ' - P - (Fake123456)',
        temat: item.Tytul,
        data: converter.timestampToIsoTzFormat(item.DataWyslaniaUnixEpoch),
        skrzynka: 'Jan Kowalski - U - (Fake123456)',
        hasZalaczniki: true,
        przeczytana: !!item.GodzinaPrzeczytania,
        nieprzeczytanePrzeczytanePrzez: null,
        wazna: false,
        uzytkownikRola: 2,
        id: item.WiadomoscId,
      };
    })
  );
});

router.get(['/api/Usuniete', '/api/UsunieteSkrzynka'], async (req: Request, res: Response) => {
  res.json(
    (await import('../../data/api/messages/WiadomosciUsuniete.json')).default.map((item) => {
      return {
        apiGlobalKey: fromString(item.WiadomoscId.toString()),
        korespondenci: item.Nadawca + ' - P - (Fake123456)',
        temat: item.Tytul,
        data: converter.timestampToIsoTzFormat(item.DataWyslaniaUnixEpoch),
        skrzynka: 'Jan Kowalski - U - (Fake123456)',
        hasZalaczniki: true,
        przeczytana: !!item.GodzinaPrzeczytania,
        nieprzeczytanePrzeczytanePrzez: null,
        wazna: false,
        uzytkownikRola: 2,
        id: item.WiadomoscId,
      };
    })
  );
});

router.get('/api/Skrzynki', async (req: Request, res: Response) => {
  const users = (await import('../../data/api/ListaUczniow.json')).default;
  res.json(
    users.map((user) => {
      return {
        globalKey: fromString(user.UzytkownikLoginId.toString()),
        nazwa: `${user.Imie} ${user.Nazwisko} - U - (${user.JednostkaSprawozdawczaSkrot})`,
        typUzytkownika: 3,
      };
    })
  );
});

router.all('/api/WiadomoscSzczegoly', (req: Request, res: Response) => {
  const message = require('../../data/api/messages/WiadomosciOdebrane')[0];
  res.json({
    data: converter.timestampToIsoTzFormat(message.DataWyslaniaUnixEpoch),
    apiGlobalKey: fromString(message.WiadomoscId.toString()),
    nadawca: 'Natalia Wrzesień - P - (Fake123456)',
    odbiorcy: ['Jan kowalski - U - (Fake123456)'],
    temat: message.Tytul,
    tresc: message.Tresc.replaceAll('\n', '<br>'),
    odczytana: true,
    zalaczniki: [
      {
        url: 'https://1drv.ms/u/s!AmvjLDq5anT2psJ4nujoBUyclWOUhw',
        nazwaPliku: 'nazwa_pliku.pptx',
      },
      {
        url: 'https://wulkanowy.github.io/',
        nazwaPliku: 'wulkanowy.txt',
      },
      {
        url: 'https://github.com/wulkanowy/wulkanowy',
        nazwaPliku: 'wulkanowy(2).txt',
      },
    ],
    id: message.WiadomoscId,
  });
});

router.all('/api/WiadomoscOdpowiedzPrzekaz', (req: Request, res: Response) => {
  const user = require('../../data/api/ListaUczniow')[1];
  const message = require('../../data/api/messages/WiadomosciOdebrane')[0];
  res.json({
    data: converter.timestampToIsoTzFormat(message.DataWyslaniaUnixEpoch),
    apiGlobalKey: fromString(message.WiadomoscId.toString()),
    uzytkownikSkrzynkaGlobalKey: fromString(user.Id.toString()),
    nadawcaSkrzynkaGlobalKey: fromString(message.NadawcaId.toString()),
    nadawcaSkrzynkaNazwa: 'Natalia Wrzesień - P - (Fake123456)',
    adresaci: [
      {
        skrzynkaGlobalKey: fromString(user.Id.toString()),
        nazwa: 'Jan Kowalski - U - (Fake123456)',
      },
    ],
    temat: message.Tytul,
    tresc: message.Tresc.replaceAll('\n', '<br>'),
    zalaczniki: [
      {
        url: 'https://1drv.ms/u/s!AmvjLDq5anT2psJ4nujoBUyclWOUhw',
        nazwaPliku: 'nazwa_pliku.pptx',
      },
    ],
    id: message.WiadomoscId,
  });
});

router.all('/api/Pracownicy', async (req: Request, res: Response) => {
  const user = (await import('../../data/api/ListaUczniow.json')).default[1];
  const recipients = (await import('../../data/api/dictionaries/Pracownicy.json')).default;
  res.json(
    recipients.map((item) => {
      return {
        skrzynkaGlobalKey: fromString(item.Id.toString()),
        nazwa: `${item.Nazwisko} ${item.Imie} - P - (${user.JednostkaSprawozdawczaSkrot})`,
      };
    })
  );
});

router.all(['/api/MoveTrash', '/api/Delete'], (req: Request, res: Response) => {
  res.status(204).send();
});

router.all('/api/WiadomoscNowa', (req: Request, res: Response) => {
  res.status(204).send();
});

export default router;
