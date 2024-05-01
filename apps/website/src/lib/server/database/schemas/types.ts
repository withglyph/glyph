import dayjs from 'dayjs';
import { customType } from 'drizzle-orm/pg-core';

export const datetime = customType<{ data: dayjs.Dayjs; driverData: string }>({
  dataType: () => 'timestamp with time zone',
  fromDriver: (value) => dayjs(value),
  toDriver: (value) => value.toISOString(),
});

export const jsonb = customType<{ data: unknown; driverData: unknown }>({
  dataType: () => 'jsonb',
  toDriver: (value) => value,
  fromDriver: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
});

export const bytea = customType<{ data: Uint8Array; driverData: Uint8Array }>({
  dataType: () => 'bytea',
  toDriver: (value) => value,
  fromDriver: (value) => value,
});
