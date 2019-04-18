export function isValidAddress(addr) {
  return !!addr && !!addr.match(/^0[xX][0-9a-fA-F]{40}$/);
}

export function isValidAmount(amt) {
  return !isNaN(parseInt(amt)) && parseInt(amt) > 0;
}
