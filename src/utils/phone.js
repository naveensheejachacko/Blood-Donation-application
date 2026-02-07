export function maskPhoneNumber(rawPhone) {
  const digits = String(rawPhone ?? '')
    .replace(/\D/g, '')
    .trim();

  if (!digits) {
    return '';
  }

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    const visiblePrefix = digits.slice(0, 2);
    const visibleSuffix = digits.slice(-2);
    const maskedMiddle = 'X'.repeat(digits.length - 4);
    return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
  }

  const visiblePrefix = digits.slice(0, 2);
  const visibleSuffix = digits.slice(-2);
  const maskedMiddle = 'X'.repeat(digits.length - 4);

  return `${visiblePrefix}${maskedMiddle}${visibleSuffix}`;
}

