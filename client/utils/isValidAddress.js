export default function isValidAddress(addr) {
  return !!addr && !!addr.match(/^0[xX][0-9a-fA-F]{40}$/);
}
