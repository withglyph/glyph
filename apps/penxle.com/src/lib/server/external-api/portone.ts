import got from 'got';
import { PRIVATE_PORTONE_API_KEY, PRIVATE_PORTONE_API_SECRET } from '$env/static/private';

const getAccessToken = async () => {
  const resp = await got
    .post('https://api.iamport.kr/users/getToken', {
      json: {
        imp_key: PRIVATE_PORTONE_API_KEY,
        imp_secret: PRIVATE_PORTONE_API_SECRET,
      },
    })
    .json<{ response: { access_token: string } }>();

  return resp.response.access_token;
};

type RegisterPaymentAmountParams = { paymentKey: string; paymentAmount: number };
export const registerPaymentAmount = async ({ paymentKey, paymentAmount }: RegisterPaymentAmountParams) => {
  await got.post({
    url: 'https://api.iamport.kr/payments/prepare',
    headers: { Authorization: await getAccessToken() },
    json: {
      merchant_uid: paymentKey,
      amount: paymentAmount,
    },
  });
};

export const getPayment = async (uid: string) => {
  const resp = await got
    .get({
      url: `https://api.iamport.kr/payments/${uid}`,
      headers: { Authorization: await getAccessToken() },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .json<any>();

  return resp;
};
