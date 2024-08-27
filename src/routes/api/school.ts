import { createEnvelope } from './utils';
import { format } from 'date-fns';
import { uuid } from 'uuidv4';
import { getByValue } from './../../utils/dictMap';
import { Router, Request, Response } from 'express';

// Doing static imports since the json data is not too much, hence the impact, if any, is likely to be minimal
import subjects from '../../../data/api/dictionaries/Przedmioty.json';
import categories from '../../../data/api/dictionaries/KategorieOcen.json';
import teachers from '../../../data/api/dictionaries/Nauczyciele.json';
import grades from '../../../data/api/student/Oceny.json';

const router = Router({});

router.get('/grade/byPupil', (req: Request, res: Response) => {
  res.json(
    createEnvelope(
      0,
      'OK',
      'IEnumerable`1',
      grades.map((item) => {
        return {
          Column: {
            Category: {
              Id: item.IdKategoria,
              Code: getByValue(categories, 'Id', item.IdKategoria).Kod,
              Name: getByValue(categories, 'Id', item.IdKategoria).Nazwa,
            },
            Code: getByValue(categories, 'Id', item.IdKategoria).Kod,
            Group: '',
            Id: 0,
            Key: uuid(),
            Name: item.Opis,
            Number: 0,
            Period: 2,
            Subject: {
              Id: item.IdPrzedmiot,
              Key: uuid(),
              Kod: getByValue(subjects, 'Id', item.IdPrzedmiot).Kod,
              Name: getByValue(subjects, 'Id', item.IdPrzedmiot).Nazwa,
              Position: getByValue(subjects, 'Id', item.IdPrzedmiot).Pozycja,
            },
            Weight: item.WagaOceny,
          },
          Comment: item.Komentarz,
          Content: item.Wpis,
          ContentRaw: `${item.Wartosc}`,
          Creator: {
            Id: item.IdPracownikD,
            Name: getByValue(teachers, 'Id', item.IdPracownikD).Imie,
            Surname: getByValue(teachers, 'Id', item.IdPracownikD).Nazwisko,
            DisplayName: getByValue(teachers, 'Id', item.IdPracownikD).Imie,
          },
          Modifier: {
            Id: item.IdPracownikM,
            Name: getByValue(teachers, 'Id', item.IdPracownikM).Imie,
            Surname: getByValue(teachers, 'Id', item.IdPracownikM).Nazwisko,
            DisplayName: getByValue(teachers, 'Id', item.IdPracownikM).Imie,
          },
          DateCreated: {
            Date: item.DataUtworzeniaTekst,
            DateDisplay: item.DataUtworzeniaTekst,
            Time: '00:01',
            Timestamp: item.DataUtworzenia,
          },
          DateModify: {
            Date: item.DataModyfikacjiTekst,
            DateDisplay: item.DataModyfikacjiTekst,
            Time: '00:02',
            Timestamp: item.DataModyfikacji,
          },
          Id: item.Id,
          Key: uuid(),
          Numerator: item.Licznik,
          Denominator: item.Mianownik,
          PupilId: 111,
          Value: item.Wartosc,
        };
      })
    )
  );
});

router.all('/lucky', (req: Request, res: Response) => {
  res.json(
    createEnvelope(0, 'OK', 'LuckyNumberPayload', {
      Day: format(new Date(), 'yyyy-MM-dd'),
      Number: format(new Date(), 'd'),
    })
  );
});

export default router;
