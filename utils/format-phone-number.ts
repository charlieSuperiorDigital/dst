export const formatPhoneNumber = (value) => {
  if (!value) return value;

  // Remove all non-digit characters
  const phoneNumber = value.replace(/[^\d]/g, "");

  // Format the number
  const phoneLength = phoneNumber.length;
  if (phoneLength < 4) return phoneNumber;
  if (phoneLength < 7)
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};
