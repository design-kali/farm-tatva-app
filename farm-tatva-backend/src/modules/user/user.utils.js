export const MOBILE_NUMBER_PATTERN = /^\d{10}$/;

export const normalizeMobileNumber = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\D/g, "").slice(0, 10);
};

export const isValidMobileNumber = (value) => {
  return MOBILE_NUMBER_PATTERN.test(value);
};

export const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const { password, email, ...safeUser } = user;
  const identifier = typeof email === "string" ? email.trim() : "";
  const mobileNumber = isValidMobileNumber(identifier) ? identifier : null;

  return {
    ...safeUser,
    email: identifier || null,
    mobileNumber,
    userId: identifier || null,
  };
};
