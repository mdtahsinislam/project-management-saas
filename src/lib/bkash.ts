import axios from "axios";

const BKASH_BASE_URL = process.env.BKASH_BASE_URL!;
const BKASH_USERNAME = process.env.BKASH_USERNAME!;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD!;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY!;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET!;

let idToken: string | null = null;

export async function getBkashToken() {
  if (idToken) return idToken;

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: BKASH_APP_KEY,
      app_secret: BKASH_APP_SECRET,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        username: BKASH_USERNAME,
        password: BKASH_PASSWORD,
      },
    }
  );

  idToken = response.data.id_token;
  return idToken;
}

export async function createBkashPayment(amount: number, invoice: string, callbackURL: string) {
  const token = await getBkashToken();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/create`,
    {
      mode: "0011",
      payerReference: " ",
      callbackURL,
      amount: amount.toString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: invoice,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: token,
        "x-app-key": BKASH_APP_KEY,
      },
    }
  );

  return response.data;
}

export async function executeBkashPayment(paymentID: string) {
  const token = await getBkashToken();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        authorization: token,
        "x-app-key": BKASH_APP_KEY,
      },
    }
  );

  return response.data;
}