const TIMEZONE = 'Africa/Cairo';

export function formatDate(iso: string, locale: string = 'en'): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(iso: string, locale: string = 'en'): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTimeRange(
  startsAt: string,
  endsAt: string,
  locale: string = 'en',
): string {
  return `${formatTime(startsAt, locale)} - ${formatTime(endsAt, locale)}`;
}

export function formatDateShort(iso: string, locale: string = 'en'): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
    timeZone: TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
}

export function toDateString(iso: string): string {
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayOfWeek(dayNumber: number, locale: string = 'en'): string {
  const days: Record<string, string[]> = {
    en: [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ],
    ar: [
      '\u0627\u0644\u0623\u062d\u062f',
      '\u0627\u0644\u0627\u062b\u0646\u064a\u0646',
      '\u0627\u0644\u062b\u0644\u0627\u062b\u0627\u0621',
      '\u0627\u0644\u0623\u0631\u0628\u0639\u0627\u0621',
      '\u0627\u0644\u062e\u0645\u064a\u0633',
      '\u0627\u0644\u062c\u0645\u0639\u0629',
      '\u0627\u0644\u0633\u0628\u062a',
    ],
  };
  return (days[locale] ?? days.en)[dayNumber] ?? '';
}

export function formatTime24(time: string): string {
  // Expects HH:MM format, returns as-is
  return time;
}
