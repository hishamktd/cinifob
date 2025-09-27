export const DATE_FORMATS = {
  DEFAULT: 'dd/MM/yyyy',
  DISPLAY: 'MMM dd, yyyy',
  SHORT: 'dd/MM/yy',
  LONG: 'EEEE, MMMM dd, yyyy',
  MONTH_YEAR: 'MMMM yyyy',
  ISO: 'yyyy-MM-dd',
  US: 'MM/dd/yyyy',
  EU: 'dd.MM.yyyy',
  WITH_TIME: 'dd/MM/yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  FULL_DATETIME: 'dd/MM/yyyy HH:mm:ss',
} as const;

export const TIME_INTERVALS = {
  FIVE_MINUTES: 5,
  TEN_MINUTES: 10,
  FIFTEEN_MINUTES: 15,
  THIRTY_MINUTES: 30,
  ONE_HOUR: 60,
} as const;

export const DAYJS_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  DISPLAY: 'MMM DD, YYYY',
  SHORT: 'DD/MM/YY',
  LONG: 'dddd, MMMM DD, YYYY',
  MONTH_YEAR: 'MMMM YYYY',
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD.MM.YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
  TIME_WITH_SECONDS: 'HH:mm:ss',
  FULL_DATETIME: 'DD/MM/YYYY HH:mm:ss',
  RELATIVE: 'fromNow',
} as const;

export type DateFormat = (typeof DATE_FORMATS)[keyof typeof DATE_FORMATS];
export type DayjsFormat = (typeof DAYJS_FORMATS)[keyof typeof DAYJS_FORMATS];
export type TimeInterval = (typeof TIME_INTERVALS)[keyof typeof TIME_INTERVALS];