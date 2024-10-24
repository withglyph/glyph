import crypto from 'node:crypto';
import https from 'node:https';
import dayjs from 'dayjs';
import got from 'got';
import numeral from 'numeral';
import { env } from '$env/dynamic/private';
import { redis } from '$lib/server/cache';

const httpsAgent = new https.Agent({
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

const getUSDExchangeRateForDate = async (date: string) => {
  const resp = await got('https://www.koreaexim.go.kr/site/program/financial/exchangeJSON', {
    searchParams: {
      authkey: env.PRIVATE_EXIM_OPENAPI_KEY,
      data: 'AP01',
      searchdate: date,
    },
    https: { rejectUnauthorized: false },
    agent: { https: httpsAgent },
  }).json<{ cur_unit: string; ttb: string }[]>();

  const usd = resp.find(({ cur_unit }) => cur_unit === 'USD');
  return numeral(usd?.ttb).value() || null;
};

export const getUSDExchangeRate = async () => {
  const value = await redis.get('usd_exchange_rate');
  if (value) {
    return Number(value);
  }

  for (let i = 0; i < 10; i++) {
    const date = dayjs.kst().subtract(i, 'day').format('YYYYMMDD');
    const rate = await getUSDExchangeRateForDate(date);

    if (rate) {
      await redis.setex('usd_exchange_rate', 86_400, rate);
      return rate;
    }
  }

  throw new Error('Failed to get USD exchange rate');
};
