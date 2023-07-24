declare module 'dayjs' {
  // eslint-disable-next-line typescript/consistent-type-definitions
  interface Dayjs {
    formatAsDate: () => string;
    formatAsDateTime: () => string;
    formatAsTime: () => string;
  }
}

export {};
