// "Now" is always config.demo_today (features.md A1). No business logic reads the system clock.
import config from '../data/config.json';

export const TODAY: string = config.demo_today;

const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WDL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MOL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const at = (iso: string) => new Date(iso.slice(0, 10) + 'T12:00:00Z');

export const daysBetween = (from: string, to: string = TODAY) => Math.round((at(to).getTime() - at(from).getTime()) / 864e5);
export const addDays = (iso: string, n: number) => new Date(at(iso).getTime() + n * 864e5).toISOString().slice(0, 10);
export const weekday = (iso: string) => at(iso).getUTCDay();
export const fmtDay = (iso: string) => `${WD[weekday(iso)]}, ${MO[at(iso).getUTCMonth()]} ${at(iso).getUTCDate()}`;
export const fmtShort = (iso: string) => `${MO[at(iso).getUTCMonth()]} ${at(iso).getUTCDate()}`;
export const fmtLong = (iso: string) => `${WDL[weekday(iso)]}, ${MOL[at(iso).getUTCMonth()]} ${at(iso).getUTCDate()}`;
export const weekdayLong = (iso: string) => WDL[weekday(iso)];
export const monthsBetween = (from: string, to: string = TODAY) => {
  const a = at(from), b = at(to);
  return a.getUTCDate() === b.getUTCDate() ? (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth() : -1;
};

// A UTC timestamp shown in America/Toronto (data/DATA_README.md, "Times").
const tor = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function toronto(utc: string): { iso: string; time: string } {
  const p: Record<string, string> = {};
  for (const x of tor.formatToParts(new Date(utc))) p[x.type] = x.value;
  const h = Number(p.hour), m = p.minute;
  const time = h === 0 && m === '00' ? '' : `${h % 12 === 0 ? 12 : h % 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  return { iso: `${p.year}-${p.month}-${p.day}`, time };
}
