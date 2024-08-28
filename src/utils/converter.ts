import { addDays, toDate, format, getTime } from 'date-fns';
const WEEK_TICK = 6048000000000;
const DAY_TICK = 864000000000;

function getDateFromTick(tick: string): Date {
  if (tick === '' || tick === undefined) {
    return getMonday(new Date());
  }

  return new Date(parseInt(tick) / 10000 - 62135596800000);
}

function getTickFromDate(date: Date): number {
  return (date.getTime() + 62135596800000) * 10000;
}

function formatDate(today: Date, iso: boolean = false): string {
  let dd = today.getDate();
  let datePrefix = dd < 10 ? '0' : '';
  let mm = today.getMonth() + 1; //January is 0!
  let monthPrefix = mm < 10 ? '0' : '';

  let yyyy = today.getFullYear();

  if (iso) return `${yyyy}-${mm}-${dd}`;

  return `${datePrefix}${dd}.${monthPrefix}${mm}.${yyyy}`;
}

type UnixTimestamp = number;
function timestampToIsoTzFormat(timestamp: UnixTimestamp): string {
  return format(new Date(timestamp * 1000), "yyyy-MM-dd'T'HH:mm:ss.SSXXX");
}

function dateToTimestamp(date: Date): number {
  return getTime(date) / 1000;
}

function getMonday(date: Date): Date {
  let day = date.getDate() - date.getDay() + 1;
  return new Date(date.getFullYear(), date.getMonth(), day);
}

function getDayName(dateStr: Date): string {
  return new Date(dateStr).toLocaleDateString('pl', { weekday: 'long' });
}

function getWeekDaysFrom(startDate: Date | string, number = 5): (Date | string)[][] {
  if (!(startDate instanceof Date)) startDate = getDateFromTick(startDate);

  const days: (Date | string)[][] = [];
  for (let i = 0; i < number; i++) {
    let date = addDays(startDate, i);
    days.push([getDayName(date), formatDate(toDate(date)), date]);
  }

  return days;
}

function getPrevWeekTick(tick: string): number {
  return getPrevTick(tick, WEEK_TICK);
}

function getPrevDayTick(tick: string): number {
  return getPrevTick(tick, DAY_TICK);
}

function getNextWeekTick(tick: string): number {
  return getNextTick(tick, WEEK_TICK);
}

function getNextDayTick(tick: string): number {
  return getNextTick(tick, DAY_TICK);
}

function getNextTick(tick: string, plus: number): number {
  tick = tick ? tick : String(getTickFromDate(new Date()));
  return parseInt(tick) + plus;
}

function getPrevTick(tick: string, minus: number): number {
  tick = tick ? tick : String(getTickFromDate(new Date()));
  return parseInt(tick) - minus;
}

export default {
  getDateString: getDateFromTick,
  getWeekDaysFrom,
  getDayName,
  getPrevDayTick,
  getNextDayTick,
  getPrevWeekTick,
  getNextWeekTick,
  formatDate,
  timestampToIsoTzFormat,
  dateToTimestamp,
};
