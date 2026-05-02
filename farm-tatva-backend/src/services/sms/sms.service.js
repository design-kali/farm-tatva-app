import "dotenv/config"; // Loads variables at the very top

/**
 * Custom SMS Client using Environment Variables
 */
async function sendSMS(phoneNumber, messageContent) {
  const baseUrl = process.env.SMS_GATEWAY_URL;
  const login = process.env.SMS_GATEWAY_LOGIN;
  const password = process.env.SMS_GATEWAY_PASSWORD;

  // Validation to ensure variables are loaded
  if (!login || !password) {
    throw new Error("SMS credentials missing from environment variables.");
  }

  const url = `${baseUrl}/messages`;
  const auth = Buffer.from(`${login}:${password}`).toString("base64");

  const phoneNumberWithCountryCode = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+91${phoneNumber}`;

  const payload = {
    phoneNumbers: [phoneNumberWithCountryCode],
    message: messageContent,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("SMS Gateway Request Failed:", error.message);
    throw error;
  }
}

export default { sendSMS };
