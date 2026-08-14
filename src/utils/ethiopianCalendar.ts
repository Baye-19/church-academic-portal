export interface EthiopianDate {
  year: number;
  month: number; // 1 - 13
  day: number; // 1 - 30 (or 1 - 6 for Pagumen)
  monthNameAm: string;
  monthNameEn: string;
  dayOfWeekAm: string;
  dayOfWeekEn: string;
}

export interface EthiopianTime {
  hour: number;
  minute: number;
  second: number;
  periodAm: string;
  periodEn: string;
  formattedAm: string;
  formattedEn: string;
}

export const ETHIOPIAN_MONTHS = [
  { id: 1, nameAm: 'መስከረም', nameEn: 'Meskerem', maxDays: 30 },
  { id: 2, nameAm: 'ጥቅምት', nameEn: 'Tikimt', maxDays: 30 },
  { id: 3, nameAm: 'ኅዳር', nameEn: 'Hidar', maxDays: 30 },
  { id: 4, nameAm: 'ታኅሣሥ', nameEn: 'Tahsas', maxDays: 30 },
  { id: 5, nameAm: 'ጥር', nameEn: 'Tir', maxDays: 30 },
  { id: 6, nameAm: 'የካቲት', nameEn: 'Yekatit', maxDays: 30 },
  { id: 7, nameAm: 'መጋቢት', nameEn: 'Megabit', maxDays: 30 },
  { id: 8, nameAm: 'ሚያዝያ', nameEn: 'Miyazya', maxDays: 30 },
  { id: 9, nameAm: 'ግንቦት', nameEn: 'Ginbot', maxDays: 30 },
  { id: 10, nameAm: 'ሰኔ', nameEn: 'Sene', maxDays: 30 },
  { id: 11, nameAm: 'ሐምሌ', nameEn: 'Hamle', maxDays: 30 },
  { id: 12, nameAm: 'ነሐሴ', nameEn: 'Nehase', maxDays: 30 },
  { id: 13, nameAm: 'ጳጉሜን', nameEn: 'Pagumen', maxDays: 6 },
];

export const ETHIOPIAN_DAYS = [
  { id: 0, nameAm: 'እሑድ', nameEn: 'Sunday' },
  { id: 1, nameAm: 'ሰኞ', nameEn: 'Monday' },
  { id: 2, nameAm: 'ማክሰኞ', nameEn: 'Tuesday' },
  { id: 3, nameAm: 'ረቡዕ', nameEn: 'Wednesday' },
  { id: 4, nameAm: 'ሐሙስ', nameEn: 'Thursday' },
  { id: 5, nameAm: 'አርብ', nameEn: 'Friday' },
  { id: 6, nameAm: 'ቅዳሜ', nameEn: 'Saturday' },
];

/**
 * Converts a Gregorian date (Date object, ISO string, or timestamp) to Ethiopian date.
 */
export function gregorianToEthiopian(inputDate?: Date | string | number | null): EthiopianDate {
  let d: Date;
  if (!inputDate) {
    d = new Date();
  } else if (typeof inputDate === 'string' || typeof inputDate === 'number') {
    d = new Date(inputDate);
    if (isNaN(d.getTime())) {
      // If parsing fails for a YYYY-MM-DD string, handle manually
      const parts = String(inputDate).split(/[-T :]/);
      if (parts.length >= 3) {
        d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      } else {
        d = new Date();
      }
    }
  } else {
    d = inputDate;
  }

  const gy = d.getFullYear();
  const gm = d.getMonth() + 1; // 1-12
  const gd = d.getDate();

  const a = Math.floor((14 - gm) / 12);
  const y = gy + 4800 - a;
  const m = gm + 12 * a - 3;
  const jdn =
    gd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;

  const dayOfWeekIndex = d.getDay(); // 0 = Sunday
  const dayInfo = ETHIOPIAN_DAYS[dayOfWeekIndex] || ETHIOPIAN_DAYS[0];
  const monthInfo = ETHIOPIAN_MONTHS[month - 1] || ETHIOPIAN_MONTHS[0];

  return {
    year,
    month,
    day,
    monthNameAm: monthInfo.nameAm,
    monthNameEn: monthInfo.nameEn,
    dayOfWeekAm: dayInfo.nameAm,
    dayOfWeekEn: dayInfo.nameEn,
  };
}

/**
 * Converts an Ethiopian date to Gregorian Date
 */
export function ethiopianToGregorian(year: number, month: number, day: number): Date {
  const jdn = 1723856 + 365 * year + Math.floor(year / 4) + 30 * (month - 1) + day - 1;
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const gregDay = e - Math.floor((153 * m + 2) / 5) + 1;
  const gregMonth = m + 3 - 12 * Math.floor(m / 10);
  const gregYear = 100 * b + d - 4800 + Math.floor(m / 10);

  return new Date(gregYear, gregMonth - 1, gregDay);
}

/**
 * Converts a 24-hour time to Ethiopian 12-hour time format
 */
export function getEthiopianTime(inputDate?: Date | string | number | null): EthiopianTime {
  let d: Date;
  if (!inputDate) {
    d = new Date();
  } else if (typeof inputDate === 'string' || typeof inputDate === 'number') {
    d = new Date(inputDate);
    if (isNaN(d.getTime())) d = new Date();
  } else {
    d = inputDate;
  }

  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  let ethHour = hour - 6;
  if (ethHour < 0) ethHour += 24;

  let periodAm = '';
  let periodEn = '';
  if (hour >= 6 && hour < 12) {
    periodAm = 'ከጠዋቱ';
    periodEn = 'Morning';
  } else if (hour >= 12 && hour < 18) {
    periodAm = 'ከቀኑ';
    periodEn = 'Day';
  } else if (hour >= 18 && hour < 24) {
    periodAm = 'ከምሽቱ';
    periodEn = 'Night';
  } else {
    periodAm = 'ከሌሊቱ';
    periodEn = 'Late Night';
  }

  let displayHour = ethHour % 12;
  if (displayHour === 0) displayHour = 12;

  const minStr = minute.toString().padStart(2, '0');

  return {
    hour: displayHour,
    minute,
    second,
    periodAm,
    periodEn,
    formattedAm: `${periodAm} ${displayHour}:${minStr} ሰዓት`,
    formattedEn: `${displayHour}:${minStr} (${periodEn})`,
  };
}

/**
 * Formats a date into Ethiopian Date string (e.g. "ነሐሴ 8 ቀን 2018 ዓ.ም." or "Nehase 8, 2018 E.C.")
 */
export function formatEthiopianDate(
  inputDate?: Date | string | number | null,
  lang: 'am' | 'en' = 'am',
  includeDayOfWeek: boolean = false
): string {
  if (!inputDate) return '';
  const eth = gregorianToEthiopian(inputDate);

  if (lang === 'am') {
    const dow = includeDayOfWeek ? `${eth.dayOfWeekAm}፣ ` : '';
    return `${dow}${eth.monthNameAm} ${eth.day} ቀን ${eth.year} ዓ.ም.`;
  } else {
    const dow = includeDayOfWeek ? `${eth.dayOfWeekEn}, ` : '';
    return `${dow}${eth.monthNameEn} ${eth.day}, ${eth.year} E.C.`;
  }
}

/**
 * Formats a date and time into Ethiopian Calendar Date and Ethiopian Time
 * (e.g., "ነሐሴ 8 ቀን 2018 ዓ.ም. ከጠዋቱ 3:30 ሰዓት" or "Nehase 8, 2018 E.C. • 3:30 (Morning)")
 */
export function formatEthiopianDateTime(
  inputDate?: Date | string | number | null,
  lang: 'am' | 'en' = 'am'
): string {
  if (!inputDate) return '';
  const ethDate = formatEthiopianDate(inputDate, lang, false);
  const ethTime = getEthiopianTime(inputDate);

  if (lang === 'am') {
    return `${ethDate} ${ethTime.formattedAm}`;
  } else {
    return `${ethDate} • ${ethTime.formattedEn}`;
  }
}

/**
 * Formats time only in Ethiopian format
 */
export function formatEthiopianTimeOnly(
  inputDate?: Date | string | number | null,
  lang: 'am' | 'en' = 'am'
): string {
  if (!inputDate) return '';
  const ethTime = getEthiopianTime(inputDate);
  return lang === 'am' ? ethTime.formattedAm : ethTime.formattedEn;
}

/**
 * Converts HH:MM string (24-hour format) to Ethiopian time string
 * e.g. "08:30" -> "ከጠዋቱ 2:30 ሰዓት" / "2:30 (Morning)"
 */
export function formatTimeStringToEthiopian(timeStr: string, lang: 'am' | 'en' = 'am'): string {
  if (!timeStr) return '';
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr || '0', 10);
  const minute = parseInt(minStr || '0', 10);

  let ethHour = hour - 6;
  if (ethHour < 0) ethHour += 24;

  let periodAm = '';
  let periodEn = '';
  if (hour >= 6 && hour < 12) {
    periodAm = 'ከጠዋቱ';
    periodEn = 'Morning';
  } else if (hour >= 12 && hour < 18) {
    periodAm = 'ከቀኑ';
    periodEn = 'Day';
  } else if (hour >= 18 && hour < 24) {
    periodAm = 'ከምሽቱ';
    periodEn = 'Night';
  } else {
    periodAm = 'ከሌሊቱ';
    periodEn = 'Late Night';
  }

  let displayHour = ethHour % 12;
  if (displayHour === 0) displayHour = 12;

  const minFormatted = minute.toString().padStart(2, '0');

  if (lang === 'am') {
    return `${periodAm} ${displayHour}:${minFormatted} ሰዓት`;
  } else {
    return `${displayHour}:${minFormatted} (${periodEn})`;
  }
}

/**
 * Returns current Academic Year formatted with Ethiopian Calendar primary and Gregorian secondary
 * (e.g. "2018 ዓ.ም." / "2018 E.C. (2025/2026)")
 */
export function getEthiopianAcademicYearLabel(lang: 'am' | 'en' = 'am'): string {
  const eth = gregorianToEthiopian(new Date());
  // In Ethiopian calendar, academic year starts in Meskerem (Month 1, Sep).
  // If month is Meskerem (1) to Pagumen (13), the academic year is eth.year.
  const ethYear = eth.year;
  const gregYear = new Date().getFullYear();
  const gregMonth = new Date().getMonth(); // 0-indexed
  const gregAcademic = gregMonth >= 8 ? `${gregYear}/${gregYear + 1}` : `${gregYear - 1}/${gregYear}`;

  if (lang === 'am') {
    return `${ethYear} ዓ.ም. (${gregAcademic})`;
  } else {
    return `${ethYear} E.C. (${gregAcademic})`;
  }
}
