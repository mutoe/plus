export function showAmount (amount) {
  const { walletRatio = 100 } = window.FEED;

  return amount + '(积分)';
}
