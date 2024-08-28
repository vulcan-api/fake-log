import express, { Request, Response } from 'express';
const router = express.Router();
import converter from '../utils/converter';
import { getByValue } from '../utils/dictMap';
import { getGradeColorByCategoryName } from '../utils/gradeColor';
import _ from 'lodash';

(global as any).opiekunRoot = '/powiatwulkanowy/123456';

router.all('/', (req: Request, res: Response) => {
  res.render('log-exception', {
    title: 'Dziennik FakeUONET+',
    message: 'Podany identyfikator klienta jest niepoprawny.',
  });
});

router.all('/powiatwulkanowy(/12345[678])?', (req: Request, res: Response) => {
  if (req.header('Referer') || 'true' === req.query.login) {
    return res.redirect('/powiatwulkanowy/123456/Start/Index/');
  }

  res.render('login', {
    title: 'Uczeń',
  });
});

router.get('/Start/Index/', (req: Request, res: Response) => {
  res.cookie('EfebSsoAuthCookie', 'asdfasdfasdfasdfasdfasdfas', {
    domain: req.get('host')!.replace('uonetplus-opiekun', ''),
    path: '/',
    httpOnly: true,
  });
  res.cookie('idBiezacyDziennik', '1234');
  res.render('opiekun/start', {
    title: 'Witryna ucznia i rodzica – Strona główna',
  });
});

router.get('/Uczen/UczenOnChange', (req: Request, res: Response) => {
  res.cookie('idBiezacyUczen', req.query.id);

  res.redirect(req.header('Referer') ? req.header('Referer')! : '../?login=true');
});

router.get('/Dziennik/DziennikOnChange', (req: Request, res: Response) => {
  res.cookie('idBiezacyDziennik', req.query.id);

  res.redirect(req.header('Referer') ? req.header('Referer')! : '../');
});

router.get('/Uczen.mvc/DanePodstawowe', async (req: Request, res: Response) => {
  res.render('opiekun/dane', {
    title: 'Witryna ucznia i rodzica – Dane ucznia',
    data: await import('../../data/opiekun/dane.json'),
  });
});

router.get('/Oceny(.mvc|)/Wszystkie', async (req: Request, res: Response) => {
  let data;
  let viewPath: string;

  const teachers = await import('../../data/api/dictionaries/Nauczyciele.json');
  const subjects = await import('../../data/api/dictionaries/Przedmioty.json');
  const details = await import('../../data/api/student/Oceny.json');
  const subjectCategories = await import('../../data/api/dictionaries/KategorieOcen.json');
  const summary = await import('../../data/api/student/OcenyPodsumowanie.json');
  const descriptiveGrades = await import('../../data/api/student/OcenyOpisowe.json');

  if (req.query.details === '2') {
    data = details.map((item) => {
      const teacher = getByValue(teachers, 'Id', item.IdPracownikD);
      const category = getByValue(subjectCategories, 'Id', item.IdKategoria);
      return {
        subject: getByValue(subjects, 'Id', item.IdPrzedmiot).Nazwa,
        value: item.Wpis === '' ? item.Komentarz : item.Wpis,
        color: getGradeColorByCategoryName(category.Nazwa),
        symbol: category.Kod,
        description: item.Opis,
        weight: item.Waga,
        date: converter.formatDate(new Date(item.DataUtworzenia * 1000)),
        teacher: teacher.Imie + ' ' + teacher.Nazwisko,
      };
    });
    viewPath = 'opiekun/oceny-szczegolowy';
  } else {
    viewPath = 'opiekun/oceny-skrocony';
    data = {
      normalGrades: subjects.map((item) => {
        return {
          subject: item.Nazwa,
          average: getByValue(summary.SrednieOcen, 'IdPrzedmiot', item.Id).SredniaOcen,
          predictedRating: getByValue(summary.OcenyPrzewidywane, 'IdPrzedmiot', item.Id).Wpis,
          finalRating: getByValue(summary.OcenyPrzewidywane, 'IdPrzedmiot', item.Id).Wpis,
        };
      }),
      descriptiveGrades,
    };
  }

  res.render(viewPath, {
    title: 'Witryna ucznia i rodzica – Oceny',
    data: data,
  });
});

router.get('/Statystyki.mvc/Uczen', async (req: Request, res: Response) => {
  let data;
  let viewPath: string;

  if (req.query.rodzajWidoku === '1') {
    viewPath = 'opiekun/oceny-statystyki-czastkowe';
    data = (await import('../../data/opiekun/oceny-statystyki-czastkowe.json')).default.map((item) => {
      return {
        subject: item.subject,
        grade: item.grade,
        pupilAmount: item.pupilAmount,
        pupilPercent: item.pupilAmount !== 0 ? 25.000003 : 0,
        classAmount: item.classAmount,
        classPercent: item.classAmount !== 0 ? 25.000003 : 0,
      };
    });
  } else {
    viewPath = 'opiekun/oceny-statystyki-roczne';
    data = (await import('../../data/opiekun/oceny-statystyki-roczne.json')).default.map((item) => {
      return {
        subject: item.subject,
        grade: item.grade,
        amount: item.amount,
        percent: item.amount !== 0 ? 25.000003 : 0,
      };
    });
  }

  res.render(viewPath, {
    title: 'Witryna ucznia i rodzica – Statystyki ucznia',
    data: data,
  });
});

router.get('/Frekwencja.mvc', async (req: Request, res: Response) => {
  const sumStats = (await import('../../data/opiekun/frekwencja-statystyki.json')).default.reduce(
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
  const KategorieFrekwencji = await import('../../data/api/dictionaries/KategorieFrekwencji.json');
  res.render('opiekun/frekwencja', {
    title: 'Witryna ucznia i rodzica – Frekwencja',
    subjects: await import('../../data/api/dictionaries/Przedmioty.json'),
    data: _.groupBy(
      (await import('../../data/api/student/Frekwencje.json')).default.map((item) => {
        const category = getByValue(KategorieFrekwencji, 'Id', item.IdKategoria);
        return {
          number: item.Numer,
          subject: item.PrzedmiotNazwa,
          date: converter.formatDate(new Date(item.DzienTekst)),
          presence: category.Obecnosc,
          absence: category.Nieobecnosc,
          exemption: category.Zwolnienie,
          lateness: category.Spoznienie,
          excused: category.Usprawiedliwione,
          deleted: category.Usuniete,
          attendanceInfo: _.capitalize(category.Nazwa),
        };
      }),
      'number'
    ),
    stats: (await import('../../data/opiekun/frekwencja-statystyki.json')).default,
    sumStats: sumStats,
    fullPresence:
      ((sumStats.presence + sumStats.lateness + sumStats.latenessExcused) /
        (sumStats.presence +
          sumStats.absence +
          sumStats.absenceExcused +
          sumStats.absenceForSchoolReasons +
          sumStats.lateness +
          sumStats.latenessExcused)) *
      100,
    weekDays: converter.getWeekDaysFrom(req.query.data as string | Date),
    tics: {
      prev: converter.getPrevWeekTick(req.query.data as string),
      next: converter.getNextWeekTick(req.query.data as string),
    },
  });
});

router.get('/UwagiOsiagniecia.mvc/Wszystkie', async (req: Request, res: Response) => {
  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const categories = (await import('../../data/api/dictionaries/KategorieUwag.json')).default;

  res.render('opiekun/uwagi', {
    title: 'Witryna ucznia i rodzica – Uwagi i osiągnięcia',
    notes: (await import('../../data/api/student/UwagiUcznia.json')).default.map((item) => {
      return {
        date: converter.formatDate(new Date(item.DataWpisuTekst)),
        teacher: `${item.PracownikImie} ${item.PracownikNazwisko} [${
          getByValue(teachers, 'Id', item.IdPracownik).Kod
        }]`,
        category: getByValue(categories, 'Id', item.IdKategoriaUwag).Nazwa,
        content: item.TrescUwagi,
      };
    }),
  });
});

router.get('/Lekcja(.mvc|)/PlanZajec', async (req: Request, res: Response) => {
  const teachers = await import('../../data/api/dictionaries/Nauczyciele.json');
  const PoryLekcji = await import('../../data/api/dictionaries/PoryLekcji.json');
  const days = _.groupBy(
    (await import('../../data/api/student/PlanLekcjiZeZmianami.json')).default
      .filter((item) => item.PlanUcznia)
      .map((item) => {
        const teacher = getByValue(teachers, 'Id', item.IdPracownik);
        const oldTeacher = getByValue(teachers, 'Id', item.IdPracownikOld!);
        const times = getByValue(PoryLekcji, 'Id', item.IdPoraLekcji);
        return {
          number: item.NumerLekcji,
          id: item.IdPoraLekcji,
          gap: false,
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
          date: converter.formatDate(new Date(item.DzienTekst)),
        };
      }),
    'date'
  );

  const firstLesson = _.min(_.flatten(_.values(days)).map((e) => e.number));
  const lastLesson = _.max(_.flatten(_.values(days)).map((e) => e.number));

  const daysWithGaps = _.mapValues(days, (day) => {
    const dayWithGaps: { number: number; gap: boolean; start: string; end: string }[] = [];
    let prevNumber: number | null = null;

    const beforeGap = day[0].number - firstLesson!;

    for (let i = 0; i < beforeGap; i++) {
      const number = firstLesson! + i;
      const times = getByValue(PoryLekcji, 'Numer', number);
      dayWithGaps.push({
        number,
        gap: true,
        start: times.PoczatekTekst,
        end: times.KoniecTekst,
      });
    }

    day.forEach((lesson) => {
      let gap = 0;
      if (prevNumber !== null) {
        gap = lesson.number - prevNumber - 1;
      }

      for (let i = 0; i < gap; i++) {
        const number = (prevNumber || 0) + i + 1;
        const times = getByValue(PoryLekcji, 'Numer', number);
        dayWithGaps.push({
          number,
          gap: true,
          start: times.PoczatekTekst,
          end: times.KoniecTekst,
        });
      }

      prevNumber = lesson.number;

      dayWithGaps.push(lesson);
    });

    const afterGap = lastLesson! - (prevNumber || 0);

    for (let i = 0; i < afterGap; i++) {
      const number = (prevNumber || 0) + i + 1;
      const times = getByValue(PoryLekcji, 'Numer', number);
      dayWithGaps.push({
        number,
        gap: true,
        start: times.PoczatekTekst,
        end: times.KoniecTekst,
      });
    }

    return dayWithGaps;
  });

  const data = _.groupBy(_.flatten(_.values(daysWithGaps)), 'number');
  const queryData: string = req.query.data as string;

  res.render('opiekun/plan-zajec', {
    title: 'Witryna ucznia i rodzica – Plan lekcji',
    data,
    weekDays: converter.getWeekDaysFrom(queryData),
    tics: {
      prev: converter.getPrevWeekTick(queryData),
      next: converter.getNextWeekTick(queryData),
    },
  });
});

router.get('/Lekcja(.mvc|)/Zrealizowane', async (req: Request, res: Response) => {
  res.render('opiekun/plan-zrealizowane', {
    title: 'Witryna ucznia i rodzica – Plan lekcji',
    subjects: (await import('../../data/api/dictionaries/Przedmioty.json')).default,
    data: _.groupBy(
      (await import('../../data/opiekun/plan-zrealizowane.json')).default.map((item) => {
        return {
          // jshint ignore:start
          ...item,
          // jshint ignore:end
          date: converter.formatDate(new Date(item.date)),
        };
      }),
      'date'
    ),
  });
});

router.get('/Sprawdziany.mvc/Terminarz', async (req: Request, res: Response) => {
  const subjects = await import('../../data/api/dictionaries/Przedmioty.json');
  const teachers = await import('../../data/api/dictionaries/Nauczyciele.json');
  const days = converter.getWeekDaysFrom(req.query.data as string);
  res.render('opiekun/sprawdziany', {
    title: 'Witryna ucznia i rodzica – Terminarz sprawdzianów',
    data: _.groupBy(
      (await import('../../data/api/student/Sprawdziany.json')).default.map((item, index) => {
        const subject = getByValue(subjects, 'Id', item.IdPrzedmiot);
        const teacher = getByValue(teachers, 'Id', item.IdPracownik);
        let examType;
        switch (item.RodzajNumer) {
          case 1:
            examType = 'Sprawdzian';
            break;
          case 2:
            examType = 'Kartkówka';
            break;
          case 3:
            examType = 'Praca klasowa';
            break;
          default:
            examType = 'Nieznany';
        }
        return {
          entryDate: '01.01.1970',
          date: days[index][1],
          // date: converter.formatDate(new Date(item.DataTekst)),
          // dayName: converter.getDayName(item.DataTekst),
          dayName: days[index][0],
          subject: `${subject.Nazwa} ${res.locals.userInfo.OddzialKod}${
            item.PodzialSkrot ? '|' + item.PodzialSkrot : ''
          }`,
          type: examType,
          description: item.Opis,
          teacher: `${teacher.Imie} ${teacher.Nazwisko}`,
          teacherSymbol: teacher.Kod,
        };
      }),
      'date'
    ),
    weekDays: converter.getWeekDaysFrom(req.query.data as string),
    tics: {
      prev: converter.getPrevWeekTick(req.query.data as string),
      next: converter.getNextWeekTick(req.query.data as string),
    },
  });
});

router.get('/ZadaniaDomowe.mvc', async (req: Request, res: Response) => {
  const teachers = (await import('../../data/api/dictionaries/Nauczyciele.json')).default;
  const subjects = (await import('../../data/api/dictionaries/Przedmioty.json')).default;
  res.render('opiekun/zadania', {
    title: 'Witryna ucznia i rodzica – Zadania domowe',
    homework: (await import('../../data/api/student/ZadaniaDomowe.json')).default.map((item) => {
      const teacher = getByValue(teachers, 'Id', item.IdPracownik);
      const date = converter.getDateString(req.query.data as string);
      return {
        date: converter.formatDate(date),
        dayName: converter.getDayName(date),
        entryDate: converter.formatDate(new Date(item.DataTekst)),
        teacher: teacher.Imie + ' ' + teacher.Nazwisko,
        teacherSymbol: teacher.Kod,
        subject: getByValue(subjects, 'Id', item.IdPrzedmiot).Nazwa,
        content: item.Opis,
      };
    }),
    tics: {
      prev: converter.getPrevDayTick(req.query.data as string),
      next: converter.getNextDayTick(req.query.data as string),
    },
  });
});

router.get('/Szkola.mvc/Nauczyciele', async (req: Request, res: Response) => {
  const teachers = (await import('../../data/api/student/Nauczyciele.json')).default;
  const subjectsDict = (await import('../../data/api/dictionaries/Przedmioty.json')).default;
  const teachersDict = (await import('../../data/api/dictionaries/Pracownicy.json')).default;

  const headmaster = getByValue(teachersDict, 'Id', teachers.NauczycieleSzkola[0].IdPracownik);
  const tutor = getByValue(teachersDict, 'Id', teachers.NauczycieleSzkola[3].IdPracownik);
  res.render('opiekun/szkola', {
    title: 'Witryna ucznia i rodzica – Szkoła i nauczyciele',
    headMaster: `${headmaster.Imie} ${headmaster.Nazwisko}`,
    tutor: `${tutor.Imie} ${tutor.Nazwisko}`,
    teachers: teachers.NauczycielePrzedmioty.map((item) => {
      const teacher = getByValue(teachersDict, 'Id', item.IdPracownik);
      return {
        subject: getByValue(subjectsDict, 'Id', item.IdPrzedmiot).Nazwa,
        name: `${teacher.Imie} ${teacher.Nazwisko} [${teacher.Kod}]`,
      };
    }),
  });
});

router.get('/DostepMobilny.mvc', async (req: Request, res: Response) => {
  res.render('opiekun/mobilny', {
    title: 'Witryna ucznia i rodzica – Dostęp mobilny',
    devices: (await import('../../data/opiekun/zarejestrowane-urzadzenia.json')).default.map((item) => {
      const created = item.DataUtworzenia.split(' ');
      return {
        // jshint ignore:start
        ...item,
        // jshint ignore:end
        DataUtworzenia: `${converter.formatDate(new Date(created[0]))} godz: ${created[1]}`,
      };
    }),
  });
});

router.get('/DostepMobilny.mvc/Rejestruj', (req: Request, res: Response) => {
  res.render('opiekun/mobilny-rejestruj');
});

router.all('/DostepMobilny.mvc/PingForCertGeneratedToken', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: req.body.idToken % 2 === 0,
  });
});

router.get('/DostepMobilny.mvc/Wyrejestruj/:id', (req: Request, res: Response) => {
  res.render('opiekun/mobilny-wyrejestruj');
});

router.post('/DostepMobilny.mvc/PotwierdzWyrejestrowanie', (req: Request, res: Response) => {
  res.redirect('/DostepMobilny.mvc');
});

export default router;
