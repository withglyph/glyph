declare module 'dayjs' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Dayjs {
    formatAsDate: () => string;
    formatAsDateTime: () => string;
    formatAsTime: () => string;
  }
}

export {};
