import crypto from "node:crypto";
import midtransClient from "midtrans-client";
import type { Donation, PaymentNotification } from "./types.js";

const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const FINISH_URL = process.env.PAYMENT_FINISH_URL;
const ERROR_URL = process.env.PAYMENT_ERROR_URL;

let snapClient: InstanceType<typeof midtransClient.Snap> | null = null;
let coreClient: InstanceType<typeof midtransClient.CoreApi> | null = null;

function getSnap() {
  if (!SERVER_KEY) {
    throw new Error(
      "MIDTRANS_SERVER_KEY belum di-set. Lengkapi .env sebelum memakai tool pembayaran."
    );
  }
  if (!snapClient) {
    snapClient = new midtransClient.Snap({
      isProduction: IS_PRODUCTION,
      serverKey: SERVER_KEY,
      clientKey: CLIENT_KEY,
    });
  }
  return snapClient;
}

function getCore() {
  if (!SERVER_KEY) {
    throw new Error("MIDTRANS_SERVER_KEY belum di-set.");
  }
  if (!coreClient) {
    coreClient = new midtransClient.CoreApi({
      isProduction: IS_PRODUCTION,
      serverKey: SERVER_KEY,
      clientKey: CLIENT_KEY,
    });
  }
  return coreClient;
}

export interface SnapTransactionResult {
  token: string;
  redirectUrl: string;
}

export async function createSnapTransaction(
  donation: Donation
): Promise<SnapTransactionResult> {
  const snap = getSnap();

  const itemDetails =
    donation.type === "mushaf"
      ? [
          {
            id: `mushaf-${donation.id}`,
            price: donation.unitPrice,
            quantity: donation.quantity,
            name: "Wakaf Mushaf Al-Qur'an",
            category: "donasi-mushaf",
          },
        ]
      : [
          {
            id: `donasi-${donation.id}`,
            price: donation.amount,
            quantity: 1,
            name: "Donasi Uang",
            category: "donasi-uang",
          },
        ];

  const parameter = {
    transaction_details: {
      order_id: donation.orderId,
      gross_amount: donation.amount,
    },
    item_details: itemDetails,
    customer_details: {
      first_name: donation.donor.anonymous ? "Hamba Allah" : donation.donor.name,
      email: donation.donor.email,
      phone: donation.donor.phone,
    },
    callbacks: FINISH_URL ? { finish: FINISH_URL, error: ERROR_URL } : undefined,
    custom_field1: donation.type,
    custom_field2: donation.campaignId,
    custom_field3: donation.message?.slice(0, 100),
  };

  const response = await snap.createTransaction(parameter);
  return {
    token: response.token,
    redirectUrl: response.redirect_url,
  };
}

export async function fetchTransactionStatus(orderId: string) {
  const core = getCore();
  return core.transaction.status(orderId);
}

export async function cancelTransaction(orderId: string) {
  const core = getCore();
  return core.transaction.cancel(orderId);
}

export function verifySignature(notification: PaymentNotification): boolean {
  if (!notification.signature_key) return false;
  const expected = crypto
    .createHash("sha512")
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${SERVER_KEY}`
    )
    .digest("hex");
  return expected === notification.signature_key;
}

export function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus?: string
): "paid" | "pending" | "expired" | "cancelled" | "failed" {
  if (transactionStatus === "capture") {
    if (fraudStatus === "challenge") return "pending";
    if (fraudStatus === "accept") return "paid";
  }
  if (transactionStatus === "settlement") return "paid";
  if (transactionStatus === "pending") return "pending";
  if (transactionStatus === "deny") return "failed";
  if (transactionStatus === "cancel") return "cancelled";
  if (transactionStatus === "expire") return "expired";
  if (transactionStatus === "failure") return "failed";
  return "pending";
}
