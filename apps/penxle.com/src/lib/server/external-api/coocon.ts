// spell-checker:disable

import dayjs from 'dayjs';
import got from 'got';
import iconv from 'iconv-lite';
import numeral from 'numeral';
import { env } from '$env/dynamic/private';
import { redis } from '$lib/server/cache';

const getTxId = async () => {
  const date = dayjs.kst().format('YYYYMMDD');
  const key = `coocon_txid:${date}`;

  const seq = await redis.incr(key);
  await redis.expire(key, 86_400);
  return numeral(seq).format('0000000');
};

type GetAccountHolderNameParams = { bankCode: string; accountNumber: string };
export const getAccountHolderName = async ({ bankCode, accountNumber }: GetAccountHolderNameParams) => {
  const buffer = await got({
    url: 'https://gw.coocon.co.kr/sol/gateway/acctnm_rcms_wapi.jsp',
    method: 'POST',
    json: {
      SECR_KEY: env.PRIVATE_COOCON_RCMS_KEY,
      KEY: 'ACCTNM_RCMS_WAPI',
      REQ_DATA: [
        {
          TRSC_SEQ_NO: await getTxId(),
          BANK_CD: bankCode,
          SEARCH_ACCT_NO: accountNumber,
        },
      ],
    },
  }).buffer();

  const resp = JSON.parse(iconv.decode(buffer, 'euc-kr'));

  if (resp.RSLT_CD !== '000') {
    throw new Error(`[${resp.RSLT_CD}] ${resp.RSLT_MSG}`);
  }

  return resp.RESP_DATA[0].ACCT_NM as string;
};

type TransferOutParams = { bankCode: string; accountNumber: string; amount: number; memo: string };
export const transferOut = async ({ bankCode, accountNumber, amount, memo }: TransferOutParams) => {
  const txId = await getTxId();

  const buffer = await got({
    url: 'https://gw.coocon.co.kr/sol/gateway/webilling_wapi.jsp',
    method: 'POST',
    json: {
      SECR_KEY: env.PRIVATE_COOCON_BILLING_KEY,
      KEY: 'WAPI_1100',
      REQ_DATA: [
        {
          TRSC_SEQ_NO: txId,
          TRSC_DT: dayjs.kst().format('YYYYMMDD'),
          TRT_INST_CD: env.PRIVATE_COOCON_INST_ID,
          MO_BANK_CD: '003',
          MO_ACCT_NO: env.PRIVATE_COOCON_ACCOUNT_NUMBER,
          BANK_CD: bankCode,
          ACCT_NO: accountNumber,
          TRSC_AMT: amount,
          OUT_NAME: memo,
          IN_NAME: '(주)펜슬컴퍼니',
        },
      ],
    },
  }).buffer();

  const resp = JSON.parse(iconv.decode(buffer, 'euc-kr'));

  if (
    resp.RSLT_CD !== '000' &&
    resp.RSLT_CD !== '001' &&
    resp.RSLT_CD !== 'TIM' &&
    resp.RSLT_CD !== '9979' &&
    resp.RSLT_CD !== '9980' &&
    resp.RSLT_CD !== '9999'
  ) {
    throw new Error(`[${resp.RSLT_CD}] ${resp.RSLT_MSG}`);
  }

  return {
    txId,
  };
};

type VerifyTransferOutParams = { txId: string };
export const verifyTransferOut = async ({ txId }: VerifyTransferOutParams) => {
  const buffer = await got({
    url: 'https://gw.coocon.co.kr/sol/gateway/webilling_wapi.jsp',
    method: 'POST',
    json: {
      SECR_KEY: env.PRIVATE_COOCON_BILLING_KEY,
      KEY: 'WAPI_6113',
      REQ_DATA: [
        {
          TRSC_SEQ_NO: await getTxId(),
          TRSC_DT: dayjs.kst().format('YYYYMMDD'),
          TRT_INST_CD: env.PRIVATE_COOCON_INST_ID,
          RQRE_TMSG_NO: txId,
          BANK_CD: '003',
        },
      ],
    },
  }).buffer();

  const resp = JSON.parse(iconv.decode(buffer, 'euc-kr'));

  if (resp.RSLT_CD !== '000') {
    throw new Error(`[${resp.RSLT_CD}] ${resp.RSLT_MSG}`);
  }

  return {
    success: resp.ORG_RSPS_CD === '0000',
    amount: Number(resp.TRSC_AMT),
  };
};

export const getAccountBalance = async () => {
  const buffer = await got({
    url: 'https://gw.coocon.co.kr/sol/gateway/webilling_wapi.jsp',
    method: 'POST',
    json: {
      SECR_KEY: env.PRIVATE_COOCON_BILLING_KEY,
      KEY: 'WAPI_2100',
      REQ_DATA: [
        {
          TRSC_SEQ_NO: await getTxId(),
          TRT_INST_CD: env.PRIVATE_COOCON_INST_ID,
          BANK_CD: '003',
          ACCT_NO: env.PRIVATE_COOCON_ACCOUNT_NUMBER,
        },
      ],
    },
  }).buffer();

  const resp = JSON.parse(iconv.decode(buffer, 'euc-kr'));

  if (resp.RSLT_CD !== '000') {
    throw new Error(`[${resp.RSLT_CD}] ${resp.RSLT_MSG}`);
  }

  return Number(resp.BAL_AMT);
};

type VerifyResidentRegistrationNumberParams = { name: string; residentRegistrationNumber: string; issuedAt: string };
export const verifyResidentRegistrationNumber = async ({
  name,
  residentRegistrationNumber,
  issuedAt,
}: VerifyResidentRegistrationNumberParams) => {
  const resp = await got({
    url: 'https://sgw.coocon.co.kr/sol/gateway/scrap_wapi_std.jsp',
    method: 'POST',
    json: {
      API_KEY: env.PRIVATE_COOCON_SCRAPE_KEY,
      API_ID: '1320',
      BANKCD: '104',
      NAME: name,
      REGNO: residentRegistrationNumber,
      ISSUE_DATE: issuedAt,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).json<any>();

  if (resp.RESULT_CD !== '00000000') {
    throw new Error(`[${resp.RESULT_CD}] ${resp.RESULT_MG}`);
  }

  return {
    success: resp.AGREEMENT === 'Y',
    reason: resp.DISAGREEMENT_REASON as string,
  };
};
