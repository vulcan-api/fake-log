import { Router, Response, Request } from 'express';
import protocol from '../utils/connection';
import { getByValue } from '../utils/dictMap';
import converter from '../utils/converter';
import Tokens from 'csrf';
import _ from 'lodash';
import { getGradeColorByCategoryName } from '../utils/gradeColor';
import { validatePolish } from 'validate-polish';
import {
  format,
  fromUnixTime,
  getYear,
  addYears,
  addMonths,
  addDays,
  subDays,
  differenceInDays,
  parseISO,
  startOfWeek,
} from 'date-fns';

const router = Router({ mergeParams: true });
router.get('/', (req: Request, res: Response) => {
  const base = protocol(req) + '://' + req.get('host') + '/powiatwulkanowy/123456';
  res.json({
    status: 'sucess',
    data: {
      endpoints: [
        '/Autoryzacja.mvc/Post',
        '/EgzaminySemestralne.mvc/Get',
        '/EgzaminyZewnetrzne.mvc/Get',
        '/EwidencjaObecnosci.mvc/Get',
        '/FormularzeSzablony.mvc/Get',
        '/FormularzeSzablonyDownload.mvc/Get',
        '/FormularzeWysylanie.mvc/Get',
        '/FormularzeWysylanie.mvc/Post',
        '/Frekwencja.mvc/Get',
        '/FrekwencjaStatystyki.mvc/Get',
        '/FrekwencjaStatystykiPrzedmioty.mvc/Get',
        '/Jadlospis.mvc/Get',
        '/LekcjeZrealizowane.mvc/GetPrzedmioty',
        '/LekcjeZrealizowane.mvc/GetZrealizowane',
        '/Oceny.mvc/Get',
        '/OkresyUmowOplat.mvc/Get',
        '/Oplaty.mvc/Get',
        '/PlanZajec.mvc/Get',
        '/PodrecznikiLataSzkolne.mvc/Get',
        '/PodrecznikiUcznia.mvc/Get',
        '/Pomoc.mvc/Get',
        '/RejestracjaUrzadzeniaToken.mvc/Get',
        '/RejestracjaUrzadzeniaToken.mvc/Delete',
        '/RejestracjaUrzadzeniaTokenCertyfikat.mvc/Get',
        '/Sprawdziany.mvc/Get',
        '/Statystyki.mvc/GetOcenyCzastkowe',
        '/Statystyki.mvc/GetOcenyRoczne',
        '/Statystyki.mvc/GetPunkty',
        '/SzkolaINauczyciele.mvc/Get',
        '/Uczen.mvc/Get',
        '/UczenZdjecie.mvc/Get',
        '/UczenCache.mvc/Get',
        '/UczenDziennik.mvc/Get',
        '/Usprawiedliwienia.mvc/Post',
        '/UwagiIOsiagniecia.mvc/Get',
        '/Homework.mvc/Get',
        '/Zebrania.mvc/Get',
        '/ZarejestrowaneUrzadzenia.mvc/Get',
        '/ZarejestrowaneUrzadzenia.mvc/Delete',
        '/ZgloszoneNieobecnosci.mvc/Get',
        '/ZgloszoneNieobecnosci.mvc/Post',
      ].map((item) => {
        return base + item;
      }),
    },
  });
});

router.get('/LoginEndpoint.aspx', (req: Request, res: Response) => {
  res.redirect('/Start');
});

router.get('/Start', (req: Request, res: Response) => {
  res.render('uczen/start');
});

router.all('/UczenCache.mvc/Get', async (req: Request, res: Response) => {
  res.json({
    data: {
      czyOpiekun: false,
      czyJadlospis: false,
      czyOplaty: false,
      poryLekcji: (await import('../../data/api/dictionaries/PoryLekcji.json')).default.map((item) => ({
        Id: item.Id,
        Numer: item.Numer,
        Poczatek: '1900-01-01 ' + item.PoczatekTekst + ':00',
        Koniec: '1900-01-01 ' + item.KoniecTekst + ':00',
        DataModyfikacji: '1900-01-01 00:00:00',
        IdJednostkaSprawozdawcza: 1,
        Nazwa: '' + item.Numer,
        // OkresDataOd: fromUnixTime(item.OkresDataOd), // Does not exist in the json stored objects
      })),
      pokazLekcjeZrealizowane: true,
      serverDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    },
    success: true,
  });
});

router.all('/UczenDziennik.mvc/Get', async (req: Request, res: Response) => {
  const students = (await import('../../data/api/ListaUczniow.json')).default;
  res.json({
    data: students
      .reduce<{ [key: string]: any }[]>((prev, current) => {
        return prev
          .concat(Array(current.OkresPoziom).fill(current))
          .map((item, i: number, array) => {
            return {
              // jshint ignore:start
              ...item,
              // jshint ignore:end
              OkresPoziom: i + 1 - 4 > 0 ? i + 1 - 4 : i + 1,
              IdOkresKlasyfikacyjny: (i + 1) * 2,
              year: getYear(parseISO(item.OkresDataOdTekst)) + i - array.length + 1,
              OkresDataOd: addYears(parseISO(item.OkresDataOdTekst), i - array.length + 1),
              OkresDataDo: addYears(parseISO(item.OkresDataDoTekst), i - array.length + 1),
            };
          })
          .reverse();
      }, [])
      .map((item) => {
        return {
          Id: item.OkresPoziom,
          IdUczen: item.Id,
          UczenImie: item.Imie,
          UczenImie2: item.Imie2,
          UczenNazwisko: item.Nazwisko,
          IsDziennik: true,
          IdDziennik: item.OkresNumer === 1 ? item.IdOkresKlasyfikacyjny : item.IdOkresKlasyfikacyjny - 1,
          IdPrzedszkoleDziennik: 0,
          Poziom: item.OkresPoziom,
          Symbol: item.OddzialSymbol,
          Nazwa: null,
          DziennikRokSzkolny: item.year,
          Okresy: [
            item.OkresNumer === 1 ? item.IdOkresKlasyfikacyjny : item.IdOkresKlasyfikacyjny - 1,
            item.OkresNumer === 2 ? item.IdOkresKlasyfikacyjny : item.IdOkresKlasyfikacyjny + 1,
          ].map((semesterId, i) => {
            return {
              NumerOkresu: i + 1,
              Poziom: item.OkresPoziom,
              DataOd: format(addMonths(item.OkresDataOd, i * 5), 'yyyy-MM-dd HH:mm:ss'),
              DataDo: format(addMonths(item.OkresDataDo, i * 7), 'yyyy-MM-dd HH:mm:ss'),
              IdOddzial: item.IdOddzial,
              IdJednostkaSprawozdawcza: item.IdJednostkaSprawozdawcza,
              IsLastOkres: i === 1,
              Id: semesterId,
            };
          }),
          DziennikDataOd: format(addMonths(item.OkresDataOd, 0), 'yyyy-MM-dd HH:mm:ss'),
          DziennikDataDo: format(addMonths(item.OkresDataDo, 7), 'yyyy-MM-dd HH:mm:ss'),
          IdJednostkaSkladowa: 12345,
          IdSioTyp: 11,
          IsDorosli: false,
          IsPolicealna: false,
          Is13: false,
          IsArtystyczna: false,
          IsArtystyczna13: false,
          IsSpecjalny: false,
          IsPrzedszkola: false,
          IsAuthorized: item.Id !== 1,
          UczenPelnaNazwa: `${item.OkresPoziom}${item.OddzialSymbol} ${item.year} - ${item.Imie} ${item.Nazwisko}`,
        };
      }),
    success: true,
  });
});

router.all('/Autoryzacja.mvc/Post', (req: Request, res: Response) => {
  res.json({
    data: {
      success: validatePolish.pesel(req.body.data?.Pesel ?? ''),
    },
    success: true,
  });
});

router.all('/Home.mvc/RefreshSession', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/Diety.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/EgzaminySemestralne.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/EgzaminyZewnetrzne.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/EwidencjaObecnosci.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/FormularzeSzablony.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/FormularzeSzablonyDownload.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/FormularzeWysylanie.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/FormularzeWysylanie.mvc/Post', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/Frekwencja.mvc/Get', async (req: Request, res: Response) => {
  const attendance = (await import('../../data/api/student/Frekwencje.json')).default;
  res.json({
    data: {
      UsprawiedliwieniaAktywne: true,
      Dni: [],
      UsprawiedliwieniaWyslane: [],
      Frekwencje: attendance.map((item) => {
        let offset = new Date(item.DzienTekst).getDay() - new Date(attendance[0].DzienTekst).getDay();
        let date;
        if (req.body.data) {
          date = converter.formatDate(
            addDays(new Date(req.body.data.replace(' ', 'T').replace(/Z$/, '') + 'Z'), offset),
            true
          );
        } else date = item.DzienTekst;
        return {
          IdKategoria: item.IdKategoria,
          NrDnia: item.Numer,
          Symbol: '/',
          SymbolImage: 'data:image/gif;base64,R0lGODlhAQABAIAAAMLCwgAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==',
          PrzedmiotNazwa: item.PrzedmiotNazwa,
          IdPoraLekcji: item.IdPoraLekcji,
          Data: `${date} 00:00:00`,
          LekcjaOddzialId: item.Dzien * item.Numer,
        };
      }),
    },
    success: true,
  });
});

router.all('/FrekwencjaStatystyki.mvc/Get', async (req: Request, res: Response) => {
  const attendance = (await import('../../data/opiekun/frekwencja-statystyki.json')).default;
  const sumStats = attendance.reduce(
    (prev, current) => {
      return {
        presence: prev.presence + current.presence,
        absence: prev.absence + current.absence,
        absenceExcused: prev.absenceExcused + current.absenceExcused,
        absenceForSchoolReasons: prev.absenceForSchoolReasons + current.absenceForSchoolReasons,
        lateness: prev.lateness + current.lateness,
        latenessExcused: prev.latenessExcused + current.latenessExcused,
        exemption: prev.exemption + current.exemption,
      };
    },
    {
      presence: 0,
      absence: 0,
      absenceExcused: 0,
      absenceForSchoolReasons: 0,
      lateness: 0,
      latenessExcused: 0,
      exemption: 0,
    }
  );

  res.json({
    data: {
      Podsumowanie:
        Math.round(
          ((sumStats.presence + sumStats.lateness + sumStats.latenessExcused) /
            (sumStats.presence +
              sumStats.absence +
              sumStats.absenceExcused +
              sumStats.absenceForSchoolReasons +
              sumStats.lateness +
              sumStats.latenessExcused)) *
            10000
        ) / 100,
      Statystyki: [...Array(7).keys()].map((j) => {
        const name = (i: number) => {
          switch (i) {
            case 0:
              return 'Obecność';
            case 1:
              return 'Nieobecność nieusprawiedliwiona';
            case 2:
              return 'Nieobecność usprawiedliwiona';
            case 3:
              return 'Nieobecność z przyczyn szkolnych';
            case 4:
              return 'Spóźnienie nieusprawiedliwione';
            case 5:
              return 'Spóźnienie usprawiedliwione';
            case 6:
              return 'Zwolnienie';
          }
        };
        const value = (month: number, i: number) => {
          switch (i) {
            case 0:
              return attendance[month].presence;
            case 1:
              return attendance[month].absence;
            case 2:
              return attendance[month].absenceExcused;
            case 3:
              return attendance[month].absenceForSchoolReasons;
            case 4:
              return attendance[month].lateness;
            case 5:
              return attendance[month].latenessExcused;
            case 6:
              return attendance[month].exemption;
          }
        };
        return {
          Id: j + 1,
          NazwaTypuFrekwencji: name(j),
          Wrzesien: value(0, j),
          Pazdziernik: value(1, j),
          Listopad: value(2, j),
          Grudzien: value(3, j),
          Styczen: value(4, j),
          Luty: value(5, j),
          Marzec: value(6, j),
          Kwiecien: value(7, j),
          Maj: value(8, j),
          Czerwiec: value(9, j),
          Lipiec: value(10, j),
          Sierpien: value(11, j),
          Razem: 0,
        };
      }),
    },
    success: true,
  });
});

router.all('/FrekwencjaStatystykiPrzedmioty.mvc/Get', async (req: Request, res: Response) => {
  const subjects = (await import('../../data/api/dictionaries/Przedmioty.json')).default.map((item) => {
    return {
      Id: item.Id,
      Nazwa: item.Nazwa,
    };
  });
  subjects.unshift({
    Id: -1,
    Nazwa: 'Wszystkie',
  });
  subjects.push(
    {
      Id: 0,
      Nazwa: 'Brak opisu lekcji',
    },
    {
      Id: 492,
      Nazwa: 'Opieka nad uczniami',
    }
  );
  res.json({
    data: subjects,
    success: true,
  });
});

router.all('/Jadlospis.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/LekcjeZrealizowane.mvc/GetPrzedmioty', async (req: Request, res: Response) => {
  const subjects = (await import('../../data/api/dictionaries/Przedmioty.json')).default.map((item) => {
    return {
      IdPrzedmiot: item.Id,
      Nazwa: item.Nazwa,
    };
  });
  subjects.unshift({
    IdPrzedmiot: -1,
    Nazwa: 'Wszystkie',
  });
  res.json({
    data: subjects,
    success: true,
  });
});

router.all('/LekcjeZrealizowane.mvc/GetZrealizowane', async (req: Request, res: Response) => {
  const realized = (await import('../../data/opiekun/plan-zrealizowane.json')).default;
  const requestDate = req.body.poczatek
    ? parseISO(req.body.poczatek.replace('T', ' ').replace(/Z$/, ''))
    : parseISO(realized[0].date);
  const baseOffset = differenceInDays(requestDate, parseISO(realized[0].date));

  res.json({
    data: _.groupBy(
      realized.map((item) => {
        return {
          Data: `${converter.formatDate(addDays(parseISO(item.date), baseOffset), true)} 00:00:00`,
          Przedmiot: item.subject,
          NrLekcji: item.number,
          Temat: item.topic,
          Nauczyciel: `${item.teacher} [${item.teacherSymbol}]`,
          Zastepstwo: '',
          Nieobecnosc: item.absence,
          PseudonimUcznia: null,
          ZasobyPubliczne: '',
          PrzedmiotDisplay: item.subject,
        };
      }),
      (item) => converter.formatDate(new Date(item.Data))
    ),
    success: true,
  });
});

router.all('/Oceny.mvc/Get', async (req: Request, res: Response) => {
  const summary = (await import('../../data/api/student/OcenyPodsumowanie.json')).default;
  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const subjectCategories = (await import('../../data/api/dictionaries/KategorieOcen.json')).default;
  const descriptiveGrades = (await import('../../data/api/student/OcenyOpisowe.json')).default;
  const grades = (await import('../../data/api/student/Oceny.json')).default;
  res.json({
    data: {
      IsSrednia: true,
      IsPunkty: true,
      Oceny: (await import('../../data/api/dictionaries/Przedmioty.json')).default.map((item, index) => {
        return {
          Przedmiot: item.Nazwa,
          Pozycja: item.Pozycja,
          OcenyCzastkowe: grades
            .filter((grade) => grade.IdPrzedmiot === item.Id)
            .map((item, index) => {
              const teacher = getByValue(teachers, 'Id', item.IdPracownikD);
              const category = getByValue(subjectCategories, 'Id', item.IdKategoria);
              let gradeDate;

              if (index == 0) {
                gradeDate = converter.formatDate(new Date());
              } else {
                gradeDate = converter.formatDate(new Date(item.DataUtworzenia * 1000));
              }

              return {
                Nauczyciel: `${teacher.Imie} ${teacher.Nazwisko}`,
                Wpis: item.Wpis,
                Waga: Math.round(item.WagaOceny),
                NazwaKolumny: item.Opis,
                KodKolumny: category.Kod,
                DataOceny: gradeDate,
                KolorOceny: parseInt(getGradeColorByCategoryName(category.Nazwa), 16),
              };
            }),
          ProponowanaOcenaRoczna: getByValue(summary.OcenyPrzewidywane, 'IdPrzedmiot', item.Id, {
            Wpis: '',
          }).Wpis,
          OcenaRoczna: getByValue(summary.OcenyKlasyfikacyjne, 'IdPrzedmiot', item.Id, { Wpis: '' }).Wpis,
          ProponowanaOcenaRocznaPunkty: index * 2.5 + 1 + '',
          OcenaRocznaPunkty: index * 3 + 2 + '',
          Srednia: parseFloat(
            getByValue(summary.SrednieOcen, 'IdPrzedmiot', item.Id, { SredniaOcen: '0' }).SredniaOcen.replace(/,/, '.')
          ),
          SumaPunktow: getByValue(summary.SrednieOcen, 'IdPrzedmiot', item.Id, { SumaPunktow: null }).SumaPunktow,
          WidocznyPrzedmiot: false,
        };
      }),
      OcenyOpisowe: descriptiveGrades,
      TypOcen: 2,
      IsOstatniSemestr: false,
      IsDlaDoroslych: false,
    },
    success: true,
  });
});

router.all('/OkresyUmowOplat.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/Oplaty.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/PlanZajec.mvc/Get', async (req: Request, res: Response) => {
  const requestDate = req.body.data
    ? parseISO(req.body.data.replace('T', ' ').replace(/Z$/, ''))
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const schedules = (await import('../../data/api/dictionaries/PoryLekcji.json')).default;
  const lessons = _.map(
    _.groupBy(
      (await import('../../data/api/student/PlanLekcjiZeZmianami.json')).default
        .filter((item) => item.PlanUcznia)
        .map((item) => {
          const teacher = getByValue(teachers, 'Id', item.IdPracownik);
          const oldTeacher = getByValue(teachers, 'Id', item.IdPracownikOld);
          const times = getByValue(schedules, 'Id', item.IdPoraLekcji);
          return {
            number: item.NumerLekcji,
            id: item.IdPoraLekcji,
            start: times.PoczatekTekst,
            end: times.KoniecTekst,
            subject: item.PrzedmiotNazwa,
            group: item.PodzialSkrot,
            teacher: `${teacher.Imie} ${teacher.Nazwisko}`,
            oldTeacher: !_.isEmpty(oldTeacher) ? `${oldTeacher.Imie} ${oldTeacher.Nazwisko}` : false,
            room: item.Sala,
            info: item.AdnotacjaOZmianie,
            changes: item.PogrubionaNazwa,
            canceled: item.PrzekreslonaNazwa,
            date: new Date(item.DzienTekst),
          };
        }),
      'number'
    ),
    (number) => number.sort((a, b) => a.date.getTime() - b.date.getTime())
  );
  const dates = _.flatten(_.values(lessons));
  const earliestDay = new Date(_.minBy(dates, (i) => new Date(i.date))!.date);
  const latestDay = new Date(_.maxBy(dates, (i) => new Date(i.date))!.date);

  const rows = _.values(
    _.mapValues(lessons, (item) => {
      const row: { times: string; lessons: string[] } = {
        times: `${[item[0].number]}<br />${[item[0].start]}<br />${[item[0].end]}`,
        lessons: [],
      };
      let prevDay = subDays(earliestDay, 1);
      item.forEach((lesson) => {
        const gapSize = differenceInDays(lesson.date, prevDay) - 1;
        for (let i = 0; i < gapSize; i++) {
          row.lessons.push('');
        }
        let cell = '';
        if (lesson.oldTeacher) {
          cell += `<span class="x-treelabel-inv">${lesson.subject}</span>`;
          cell += `<span class="x-treelabel-inv">${lesson.room}</span>`;
          cell += `<span class="x-treelabel-inv">${lesson.oldTeacher}</span>`;
          cell += `<span class="x-treelabel-ppl x-treelabel-zas">${lesson.subject}</span>`;
          cell += `<span class="x-treelabel-ppl x-treelabel-zas">${lesson.room}</span>`;
          cell += `<span class="x-treelabel-ppl x-treelabel-zas">${lesson.teacher}</span>`;
          cell += `<span class="x-treelabel-rlz">${lesson.info}</span>`;
        } else {
          if (lesson.group) {
            cell += `<span class="${lesson.canceled ? 'x-treelabel-ppl x-treelabel-inv' : ''}">${lesson.subject} [${
              lesson.group
            }]</span>`;
            cell += `<span class="${lesson.canceled ? 'x-treelabel-ppl x-treelabel-inv' : ''}"></span>`;
          } else {
            cell += `<span class="${lesson.canceled ? 'x-treelabel-ppl x-treelabel-inv' : ''}">${
              lesson.subject
            }</span>`;
          }
          cell += `<span class="${lesson.canceled ? 'x-treelabel-ppl x-treelabel-inv' : ''}">${lesson.room}</span>`;
          cell += `<span class="${lesson.canceled ? 'x-treelabel-ppl x-treelabel-inv' : ''}">${lesson.teacher}</span>`;
          if (lesson.info) {
            cell += `<span class="x-treelabel-rlz">${lesson.info}</span>`;
          }
        }
        row.lessons.push(`<div>${cell}</div>`);
        prevDay = lesson.date;
      });
      const gapSize = differenceInDays(latestDay, prevDay);
      for (let i = 0; i < gapSize; i++) {
        row.lessons.push('');
      }

      return row;
    })
  );

  res.json({
    data: {
      Data: format(requestDate, 'yyyy-MM-dd HH:mm:ss'),
      Headers: [
        {
          Text: 'Lekcja',
          Width: '85',
          Distinction: false,
          Flex: 0,
        },
        {
          Text: `poniedziałek<br />${converter.formatDate(addDays(requestDate, 0))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `wtorek<br />${converter.formatDate(addDays(requestDate, 1))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `środa<br />${converter.formatDate(addDays(requestDate, 2))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `czwartek<br />${converter.formatDate(addDays(requestDate, 3))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `piątek<br />${converter.formatDate(addDays(requestDate, 4))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `piątek<br />${converter.formatDate(addDays(requestDate, 5))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
        {
          Text: `piątek<br />${converter.formatDate(addDays(requestDate, 6))}`,
          Width: null,
          Distinction: false,
          Flex: 1,
        },
      ],
      Rows: rows.map((row) => [row.times, ...row.lessons]),
      Additionals: (await import('../../data/opiekun/lekcje-dodatkowe.json')).default.map((item) => {
        return {
          ...item,
          Header: `poniedziałek, ${converter.formatDate(addDays(requestDate, 0))}`,
        };
      }),
    },
    success: true,
  });
});

router.all('/PodrecznikiUcznia.mvc/Get', async (req: Request, res: Response) => {
  const manuals = (await import('../../data/opiekun/Podreczniki.json')).default.map((item) => {
    return {
      Opis: item.Opis,
      Tytul: item.Tytul,
      Autor: item.Autor,
      Wydawnictwo: item.Wydawnictwo,
      Przedmiot: item.Przedmiot,
      Aktywny: item.Aktywny,
      Id: item.Id,
    };
  });
  res.json({
    data: {
      IsZatwierdzone: true,
      Podreczniki: manuals,
    },
    success: true,
  });
});

router.all('/PodrecznikiLataSzkolne.mvc/Get', async (req: Request, res: Response) => {
  const manualsDate = (await import('../../data/opiekun/PodrecznikiLataSzkolne.json')).default.map((item) => {
    return {
      Nazwa: item.Nazwa,
      Id: item.Id,
    };
  });
  res.json({
    data: manualsDate,
    success: true,
  });
});

router.all('/Pomoc.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/RejestracjaUrzadzeniaToken.mvc/Get', async (req: Request, res: Response) => {
  const student = (await import('../../data/api/ListaUczniow.json')).default[1];
  const base = protocol(req) + '://' + req.get('host');
  const token = new Tokens({ secretLength: 97, saltLength: 4 });
  const secret = token.secretSync();
  res.json({
    data: {
      TokenId: 423,
      TokenKey: 'FK100000',
      CustomerGroup: 'powiatwulkanowy',
      CustomerSymbol: student.JednostkaSprawozdawczaSymbol,
      QrCodeContent: `CERT#${base}/powiatwulkanowy/mobile-api#FK100000#ENDCERT`,
      QrCodeContentEncoded: 'xxx', // TODO: create and use qr encrypt
      QrCodeImage:
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJMAAACTAQMAAACwK7lWAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAB+klEQVRIieWWvY3EIBCFxyIggwaQaMMZLdkN+KcBb0tktIFEA96MAHnusV7pLvTEhzZYfwHyvHlvxkT/7VjmV2rLqM7AW+BLwgypV/VbIFv9NeJRwkJ51fJixZW3kQ8pS2Sjm7Q/5GzTzWi8EU1ShjqSm6jssfyt7QmDfsdYvr9fTR+xfoLaU5voFzxkNvIe3Rz50ETaXxJmgpsrhEcp2aa8SBgFPonPsZza710MCdPOkFuIN52H2oyEdZ+yQ9/eXM7QSMJM7xXvjL7RnO77njIacV+bRgjQbBUyXKkVR39oWFVtEmaT36gNzO+Uh3jr95QREpluDRSwjI2FE80xLwHGKZuEDZxtLcwIJazaJgmzld+Vz1AOXd7pvu8pG2ov3WhnY16hoox57kzt0SPcRsYIyRgSbN6m0ETMJrUFdaF67daYJwkzIc/oWPV75T19Z/ZDhnzgYHrNDJ8WETN0+6WtkdZKi4T1AcZugX4VucwkYZg9ay1bwIu47jgJo+D5MzjPkVb+5vIpG/Oa+vxbgoNnScJsVa/YhoSNgft4k7CP/AhHnjSKuHfUU4a+7SnP0b979766PGSf/YbFiF3hr28uHzMkEuKFbHSv4xCyrXeP4Jch3vNPwsY+OHu4qzMihjpi6XtV+5PKJWGf7yaFFYfPn4nwR8D+1/kBSYetNXqSF/8AAAAASUVORK5CYII=" alt="Kod QR" title="Kod QR" height="400" width="400" />',
      ImageSize: 400,
      IdLogin: student.UzytkownikLoginId,
      LoginValue: student.UzytkownikLogin,
      PIN: '999999',
      AntiForgeryAppGuid: secret,
      AntiForgeryToken: token.create(secret),
    },
    success: true,
  });
});

router.all('/RejestracjaUrzadzeniaToken.mvc/Delete', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/RejestracjaUrzadzeniaTokenCertyfikat.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: true,
    success: true,
  });
});

router.all('/Sprawdziany.mvc/Get', async (req: Request, res: Response) => {
  const subjects = (await import('../../data/api/dictionaries/Przedmioty.json')).default;
  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const exams = (await import('../../data/api/student/Sprawdziany.json')).default;
  const requestDate = req.body.data
    ? parseISO(req.body.data.replace('T', ' ').replace(/Z$/, ''))
    : parseISO(exams[0].DataTekst);
  const baseOffset = differenceInDays(requestDate, parseISO(exams[0].DataTekst));

  res.json({
    data: [...Array(4).keys()].map(function (j) {
      return {
        SprawdzianyGroupedByDayList: converter.getWeekDaysFrom(addDays(requestDate, 7 * j), 7).map((day, i) => {
          return {
            Data: converter.formatDate(new Date(day[2]), true) + ' 00:00:00',
            Sprawdziany: exams
              .filter((exam) => {
                return 0 === differenceInDays(day[2], addDays(parseISO(exam.DataTekst), baseOffset + 7 * j));
              })
              .map((item) => {
                const subject = getByValue(subjects, 'Id', item.IdPrzedmiot);
                const teacher = getByValue(teachers, 'Id', item.IdPracownik);

                return {
                  Nazwa: subject.Nazwa,
                  Pracownik: `${teacher.Imie} ${teacher.Nazwisko} [${teacher.Kod}]`,
                  DataModyfikacji: `1970-01-01 00:00:00`,
                  Opis: item.Opis,
                  Rodzaj: item.RodzajNumer,
                };
              }),
            Pokazuj: i < 5,
          };
        }),
      };
    }),
    success: true,
  });
});

router.all('/Statystyki.mvc/GetOcenyCzastkowe', async (req: Request, res: Response) => {
  let average = 2.0;
  let studentAverage = 3.0;
  res.json({
    data: _.chain((await import('../../data/opiekun/oceny-statystyki-czastkowe.json')).default)
      .groupBy('subject')
      .map((series, subject) => ({ subject, series }))
      .value()
      .map((item) => {
        average += 0.1;
        studentAverage += 0.25;
        return {
          Subject: item.subject,
          IsAverage: true,
          ClassSeries: {
            Average: average,
            IsEmpty: false,
            Items: item.series.map((item) => {
              return {
                Label: item.classAmount.toString(),
                Value: item.classAmount,
              };
            }),
          },
          StudentSeries: {
            Average: studentAverage,
            IsEmpty: false,
            Items: item.series.map((item) => {
              return {
                Label: item.pupilAmount.toString(),
                Value: item.pupilAmount,
              };
            }),
          },
        };
      }),
    success: true,
  });
});

router.all('/Statystyki.mvc/GetOcenyRoczne', async (req: Request, res: Response) => {
  res.json({
    data: _.chain((await import('../../data/opiekun/oceny-statystyki-roczne.json')).default)
      .groupBy('subject')
      .map((series, subject) => ({ subject, series }))
      .value()
      .map((item) => {
        return {
          Subject: item.subject,
          IsEmpty: false,
          Items: item.series.map((item, i) => {
            return {
              Label: item.amount.toString(),
              Description: i === 2 ? 'Tu jesteś' : '',
              Value: item.amount,
            };
          }),
        };
      }),
    success: true,
  });
});

router.all('/Statystyki.mvc/GetPunkty', async (req: Request, res: Response) => {
  res.json({
    data: {
      TableContent:
        '<table><thead><tr><th>Przedmiot</th><th>Uczeń</th><th>Średnia klasy</th></tr></thead><tbody></tbody></table>',
      Items: (await import('../../data/opiekun/oceny-statystyki-punkty.json')).default,
    },
    success: true,
  });
});

router.all('/SzkolaINauczyciele.mvc/Get', async (req: Request, res: Response) => {
  const teachers = (await import('../../data/api/student/Nauczyciele.json')).default;
  const subjectsDict = (await import('../../data/api/dictionaries/Przedmioty.json')).default;
  const teachersDict = (await import('../../data/api/dictionaries/Pracownicy.json')).default;

  const headmaster = getByValue(teachersDict, 'Id', teachers.NauczycieleSzkola[0].IdPracownik);
  const tutor = getByValue(teachersDict, 'Id', teachers.NauczycieleSzkola[3].IdPracownik);
  res.json({
    data: {
      Szkola: {
        Nazwa: res.locals.userInfo.JednostkaNazwa,
        Adres: 'Ul. Wulkanowego 30, 30-300 Fakelog.cf, Polska',
        Kontakt: '+30 300 300 300',
        Dyrektor: `${headmaster.Imie} ${headmaster.Nazwisko}`,
        Pedagog: `${tutor.Imie} ${tutor.Nazwisko}`,
        Id: 0,
      },
      Nauczyciele: teachers.NauczycielePrzedmioty.map((item) => {
        const teacher = getByValue(teachersDict, 'Id', item.IdPracownik);
        return {
          Nazwa: getByValue(subjectsDict, 'Id', item.IdPrzedmiot).Nazwa,
          Nauczyciel: `${teacher.Imie} ${teacher.Nazwisko} [${teacher.Kod}]`,
          Id: 0,
        };
      }),
      Klasa: 'Klasa 8A',
    },
    success: true,
  });
});

router.all('/Uczen.mvc/Get', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/opiekun/uczen.json')).default,
    success: true,
  });
});

router.all('/UczenZdjecie.mvc/Get', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/opiekun/uczen-zdjecie.json')).default,
    success: true,
  });
});

router.all('/Usprawiedliwienia.mvc/Post', (req: Request, res: Response) => {
  res.json({
    data: {
      success: true,
    },
    success: true,
  });
});

router.all('/UwagiIOsiagniecia.mvc/Get', async (req: Request, res: Response) => {
  const categories = (await import('../../data/api/dictionaries/KategorieUwag.json')).default;
  const teachers = (await import('../../data/api/dictionaries/Pracownicy.json')).default;
  let i = 1;
  res.json({
    data: {
      Uwagi: (await import('../../data/api/student/UwagiUcznia.json')).default.map((item) => {
        return {
          TrescUwagi: item.TrescUwagi,
          Kategoria: getByValue(categories, 'Id', item.IdKategoriaUwag).Nazwa,
          DataWpisu: format(fromUnixTime(item.DataWpisu), 'yyyy-MM-dd HH:mm:ss'),
          Nauczyciel: `${item.PracownikImie} ${item.PracownikNazwisko} [${
            getByValue(teachers, 'Id', item.IdPracownik).Kod
          }]`,

          // 19.06
          Punkty: item._points,
          PokazPunkty: item._showPoints,
          KategoriaTyp: item._category,
        };
      }),
      Osiagniecia: [
        'Konkurs na najlepszą aplikację do dziennika - pierwsze miejsce',
        'Programowanie stron internetowych - wynik bardzo dobry',
        'Olimpiada Informatyczna Juniorów - laureat',
      ],
    },
    success: true,
  });
});

router.all('/Homework.mvc/Get', async (req: Request, res: Response) => {
  const subjects = (await import('../../data/api/dictionaries/Przedmioty.json')).default;
  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const homework = (await import('../../data/api/student/ZadaniaDomowe.json')).default;
  const requestDate = req.body.date
    ? parseISO(req.body.date.replace('T', ' ').replace(/Z$/, ''))
    : parseISO(homework[0].DataTekst);
  // const baseOffset = differenceInDays(requestDate, parseISO(homework[0].DataTekst));

  res.json({
    data: [...Array(7).keys()].map((j) => {
      return {
        Date: converter.formatDate(addDays(requestDate, j), true) + ' 00:00:00',
        Homework: homework
          .filter((item) => {
            return j < 5;
            // return 0 === differenceInDays(addDays(requestDate, j), addDays(parseISO(item.DataTekst), baseOffset));
          })
          .map((item, index) => {
            const teacher = getByValue(teachers, 'Id', item.IdPracownik);
            const attachments = [
              {
                IdZadanieDomowe: index,
                HtmlTag: '<a href="https://wulkanowy.github.io/" target="_blank">Strona główna Wulkanowego</a>',
                Url: 'https://wulkanowy.github.io/',
                NazwaPliku: 'Strona główna Wulkanowego',
                IdOneDrive: 'asadfsdf',
                Id: 600 + index,
              },
              {
                IdZadanieDomowe: index,
                HtmlTag: '<a href="https://github.com/wulkanowy/wulkanowy/" target="_blank">Repozytorium kodu</a>',
                Url: 'https://github.com/wulkanowy/wulkanowy/',
                NazwaPliku: 'Repozytorium kodu',
                IdOneDrive: 'asadfsdf',
                Id: 600 + index + 1,
              },
            ];
            return {
              HomeworkId: index,
              Subject: getByValue(subjects, 'Id', item.IdPrzedmiot).Nazwa,
              Teacher: `${teacher.Imie} ${teacher.Nazwisko} [${teacher.Kod}], ${converter.formatDate(
                addDays(requestDate, j)
              )}`,
              Description: item.Opis,
              Date: converter.formatDate(addDays(requestDate, j), true) + ' 00:00:00',
              ModificationDate: converter.formatDate(addDays(requestDate, j), true) + ' 00:00:00',
              Status: 1,
              AnswerRequired: false,
              TimeLimit: null,
              Attachments: item.Id % 2 === 0 ? attachments : [],
              AnswerDate: null,
              TeachersComment: null,
              Answer: null,
              AnswerAttachments: [],
              CanReply: true,
              Readonly: true,
              Id: index,
            };
          }),
        Show: j < 5,
      };
    }),
    success: true,
  });
});

router.all('/Zebrania.mvc/Get', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/opiekun/zebrania.json')).default,
    success: true,
  });
});

router.all('/ZarejestrowaneUrzadzenia.mvc/Get', async (req: Request, res: Response) => {
  res.json({
    data: (await import('../../data/opiekun/zarejestrowane-urzadzenia.json')).default,
    success: true,
  });
});

router.all('/ZarejestrowaneUrzadzenia.mvc/Delete', (req: Request, res: Response) => {
  res.json({
    data: null,
    success: true,
  });
});

router.all('/ZgloszoneNieobecnosci.mvc/Get', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

router.all('/ZgloszoneNieobecnosci.mvc/Post', (req: Request, res: Response) => {
  res.json({
    data: {},
    success: true,
  });
});

export default router;
