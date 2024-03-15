import { calculateFeeAmount } from '$lib/utils/revenue';

for (let i = 100; i <= 100_000_000; i++) {
  const { settleAmount, taxBaseAmount, taxAmount, serviceFeeAmount } = calculateFeeAmount(i);
  if (
    Math.floor(i * 0.85) !== settleAmount ||
    Math.floor(taxBaseAmount * 0.033) !== taxAmount ||
    i - settleAmount - taxAmount !== serviceFeeAmount
  ) {
    console.error('calcurateFeeAmount is not correct', i, settleAmount, taxBaseAmount, taxAmount, serviceFeeAmount);
  }
}
