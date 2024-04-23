import dayjs from 'dayjs';

export const calculateFeeAmount = (revenueAmount: number, withdrawalFeeAmount = 0) => {
  const settleAmount = revenueAmount - withdrawalFeeAmount;
  const taxBaseAmount = settleAmount;
  const taxAmount = 0;
  const serviceFeeAmount = revenueAmount - settleAmount - taxAmount - withdrawalFeeAmount;

  return {
    settleAmount,
    taxBaseAmount,
    taxAmount,
    serviceFeeAmount,
  };
};

export const getMonthlyWithdrawalDayjs = () => dayjs().kst().date(10).hour(12).minute(0).second(0).millisecond(0);
export const getMonthlyWithdrawableDayjsBefore = () => {
  const now = dayjs();
  return now
    .kst()
    .add(now.isAfter(getMonthlyWithdrawalDayjs()) ? 1 : 0, 'month')
    .startOf('month');
};
