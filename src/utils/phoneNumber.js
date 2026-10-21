export function phoneDigits(value = "") {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("63") && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return digits;
}

export function formatPhoneNumber(value = "") {
  const digits = phoneDigits(value);
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join("-");
}
