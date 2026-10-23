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

export function assertPhoneNumberSaved(value, profile) {
  if (!profile || !Object.hasOwn(profile, "phone_number")) {
    throw new Error("The server could not confirm your mobile number was saved. Your entry has been kept. Please contact your administrator.");
  }
  if (typeof profile.phone_number !== "string" || phoneDigits(profile.phone_number) !== phoneDigits(value)) {
    throw new Error("Your mobile number was not saved correctly. Your entry has been kept. Please try saving again.");
  }
}
