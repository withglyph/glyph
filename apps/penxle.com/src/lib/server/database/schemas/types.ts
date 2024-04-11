import dayjs from 'dayjs';
import { customType } from 'drizzle-orm/pg-core';

export const datetime = customType<{ data: dayjs.Dayjs; driverData: string }>({
  dataType: () => 'timestamp with time zone',
  fromDriver: (value) => dayjs(value),
  toDriver: (value) => value.toISOString(),
});

export const jsonb = customType<{ data: unknown }>({
  dataType: () => 'jsonb',
  toDriver: (value) => value,
  fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
});
