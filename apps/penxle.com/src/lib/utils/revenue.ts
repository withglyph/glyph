import dayjs from 'dayjs';

export const calculateFeeAmount = (revenueAmount: number, withdrawalFeeAmount = 0) => {
  const settleAmount = Math.floor(revenueAmount * 0.85) - withdrawalFeeAmount;
  const taxBaseAmount = Math.floor(settleAmount / (1 - 0.033));
  const taxAmount = Math.floor(taxBaseAmount * 0.033);
  const serviceFeeAmount = revenueAmount - settleAmount - taxAmount - withdrawalFeeAmount;

  return {
    settleAmount,
    taxBaseAmount,
    taxAmount,
    serviceFeeAmount,
  };
};

export const getMonthlyWithdrawalDayjs = () => dayjs().kst().day(10).hour(12).minute(0).second(0).millisecond(0);
export const getMonthlyWithdrawableDayjsBefore = () => {
  const now = dayjs();
  return now
    .kst()
    .subtract(now.isBefore(getMonthlyWithdrawalDayjs()) ? 1 : 0, 'month')
    .startOf('month');
};
