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
