import { randomUUID } from "node:crypto";
import { z } from "zod";
import { campaignStore, donationStore, paymentLogStore, settingsStore } from "./storage.js";
import {
  cancelTransaction,
  createSnapTransaction,
  fetchTransactionStatus,
  mapTransactionStatus,
  verifySignature,
} from "./payment.js";
import { sendReceiptEmail } from "./email.js";
import type {
  Campaign,
  Donation,
  MoneyDonation,
  MushafDonation,
  PaymentNotification,
} from "./types.js";

async function getMushafUnitPrice(): Promise<number> {
  return settingsStore.getInt("mushaf_unit_price", 85000);
}

const donorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  anonymous: z.boolean().optional(),
});

function makeOrderId(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function recomputeCampaign(campaignId: string): Promise<void> {
  const campaign = await campaignStore.findById(campaignId);
  if (!campaign) return;
  const donations = (await donationStore.list()).filter(
    (d) => d.campaignId === campaign.id && d.status === "paid"
  );
  campaign.collectedAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  campaign.donorCount = donations.length;
  await campaignStore.save(campaign);
}

// ==========================================================================
// Tool: create_money_donation
// ==========================================================================
export const createMoneyDonationSchema = z.object({
  donor: donorSchema,
  amount: z.number().int().positive().min(1000),
  campaignId: z.string().optional(),
  message: z.string().max(500).optional(),
});

export async function createMoneyDonation(
  input: z.infer<typeof createMoneyDonationSchema>
): Promise<{ donation: MoneyDonation; paymentUrl: string; paymentToken: string }> {
  const id = randomUUID();
  const orderId = makeOrderId("DNS");

  const donation: MoneyDonation = {
    id,
    orderId,
    type: "uang",
    campaignId: input.campaignId,
    donor: input.donor,
    amount: input.amount,
    message: input.message,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const snap = await createSnapTransaction(donation);
  donation.paymentToken = snap.token;
  donation.paymentUrl = snap.redirectUrl;

  await donationStore.save(donation);
  return { donation, paymentUrl: snap.redirectUrl, paymentToken: snap.token };
}

// ==========================================================================
// Tool: create_mushaf_donation
// ==========================================================================
export const createMushafDonationSchema = z.object({
  donor: donorSchema,
  quantity: z.number().int().positive().max(10000),
  unitPrice: z.number().int().positive().optional(),
  campaignId: z.string().optional(),
  message: z.string().max(500).optional(),
  recipient: z
    .object({
      name: z.string(),
      address: z.string(),
    })
    .optional(),
});

export async function createMushafDonation(
  input: z.infer<typeof createMushafDonationSchema>
): Promise<{ donation: MushafDonation; paymentUrl: string; paymentToken: string }> {
  const id = randomUUID();
  const orderId = makeOrderId("MSF");
  const unitPrice = input.unitPrice ?? (await getMushafUnitPrice());
  const amount = unitPrice * input.quantity;

  const donation: MushafDonation = {
    id,
    orderId,
    type: "mushaf",
    campaignId: input.campaignId,
    donor: input.donor,
    quantity: input.quantity,
    unitPrice,
    amount,
    message: input.message,
    recipient: input.recipient,
    status: "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const snap = await createSnapTransaction(donation);
  donation.paymentToken = snap.token;
  donation.paymentUrl = snap.redirectUrl;

  await donationStore.save(donation);
  return { donation, paymentUrl: snap.redirectUrl, paymentToken: snap.token };
}

// ==========================================================================
// Tool: list_donations
// ==========================================================================
export const listDonationsSchema = z.object({
  type: z.enum(["uang", "mushaf"]).optional(),
  status: z
    .enum(["pending", "paid", "expired", "cancelled", "failed", "refunded"])
    .optional(),
  campaignId: z.string().optional(),
  donorEmail: z.string().email().optional(),
  limit: z.number().int().positive().max(500).default(50),
});

export async function listDonations(
  input: z.infer<typeof listDonationsSchema>
): Promise<{ total: number; items: Donation[] }> {
  let items = await donationStore.list();
  if (input.type) items = items.filter((d) => d.type === input.type);
  if (input.status) items = items.filter((d) => d.status === input.status);
  if (input.campaignId) items = items.filter((d) => d.campaignId === input.campaignId);
  if (input.donorEmail)
    items = items.filter((d) => d.donor.email === input.donorEmail);
  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return { total: items.length, items: items.slice(0, input.limit) };
}

// ==========================================================================
// Tool: get_donation
// ==========================================================================
export const getDonationSchema = z.object({
  idOrOrderId: z.string(),
});

export async function getDonation(
  input: z.infer<typeof getDonationSchema>
): Promise<Donation> {
  const donation = await donationStore.findById(input.idOrOrderId);
  if (!donation) throw new Error(`Donasi tidak ditemukan: ${input.idOrOrderId}`);
  return donation;
}

// ==========================================================================
// Tool: check_payment_status (sync dengan Midtrans)
// ==========================================================================
export const checkPaymentStatusSchema = z.object({
  orderId: z.string(),
});

export async function checkPaymentStatus(
  input: z.infer<typeof checkPaymentStatusSchema>
): Promise<{ donation: Donation; gatewayStatus: unknown }> {
  const donation = await donationStore.findById(input.orderId);
  if (!donation) throw new Error(`Donasi tidak ditemukan: ${input.orderId}`);

  const gateway = (await fetchTransactionStatus(donation.orderId)) as {
    transaction_status: string;
    fraud_status?: string;
    payment_type?: string;
    settlement_time?: string;
  };

  const newStatus = mapTransactionStatus(
    gateway.transaction_status,
    gateway.fraud_status
  );

  if (donation.status !== newStatus) {
    const wasPaid = donation.status === "paid";
    donation.status = newStatus;
    donation.paymentMethod = gateway.payment_type;
    donation.updatedAt = nowIso();
    if (newStatus === "paid" && !donation.paidAt) {
      donation.paidAt = gateway.settlement_time || nowIso();
    }
    await donationStore.save(donation);
    if (donation.campaignId) await recomputeCampaign(donation.campaignId);
    if (newStatus === "paid" && !wasPaid) {
      await sendReceiptEmail(donation).catch((e) =>
        console.error("[email] gagal kirim:", e)
      );
    }
  }

  return { donation, gatewayStatus: gateway };
}

// ==========================================================================
// Tool: cancel_payment
// ==========================================================================
export const cancelPaymentSchema = z.object({
  orderId: z.string(),
  reason: z.string().optional(),
});

export async function cancelPayment(
  input: z.infer<typeof cancelPaymentSchema>
): Promise<Donation> {
  const donation = await donationStore.findById(input.orderId);
  if (!donation) throw new Error(`Donasi tidak ditemukan: ${input.orderId}`);
  if (donation.status === "paid") {
    throw new Error("Donasi yang sudah dibayar tidak bisa dibatalkan via tool ini.");
  }
  await cancelTransaction(donation.orderId);
  donation.status = "cancelled";
  donation.updatedAt = nowIso();
  await donationStore.save(donation);
  return donation;
}

// ==========================================================================
// Tool: handle_payment_webhook (callback Midtrans)
// ==========================================================================
export const handleWebhookSchema = z.object({
  notification: z.object({
    order_id: z.string(),
    transaction_status: z.string(),
    status_code: z.string().optional(),
    gross_amount: z.string().optional(),
    fraud_status: z.string().optional(),
    payment_type: z.string().optional(),
    signature_key: z.string().optional(),
    transaction_id: z.string().optional(),
    transaction_time: z.string().optional(),
  }),
  verifySignature: z.boolean().default(true),
});

export async function handleWebhook(
  input: z.infer<typeof handleWebhookSchema>
): Promise<{ donation: Donation; verified: boolean }> {
  const notif = input.notification as PaymentNotification;
  const verified = input.verifySignature ? verifySignature(notif) : true;
  if (input.verifySignature && !verified) {
    throw new Error("Signature webhook tidak valid.");
  }

  await paymentLogStore.record(notif.order_id, "webhook", notif, verified);

  const donation = await donationStore.findById(notif.order_id);
  if (!donation) throw new Error(`Donasi tidak ditemukan: ${notif.order_id}`);

  const wasPaid = donation.status === "paid";
  const newStatus = mapTransactionStatus(
    notif.transaction_status,
    notif.fraud_status
  );
  donation.status = newStatus;
  donation.paymentMethod = notif.payment_type;
  donation.updatedAt = nowIso();
  if (newStatus === "paid" && !donation.paidAt) {
    donation.paidAt = notif.transaction_time || nowIso();
  }
  await donationStore.save(donation);
  if (donation.campaignId) await recomputeCampaign(donation.campaignId);
  if (newStatus === "paid" && !wasPaid) {
    await sendReceiptEmail(donation).catch((e) =>
      console.error("[email] gagal kirim:", e)
    );
  }

  return { donation, verified };
}

// ==========================================================================
// Tool: create_campaign
// ==========================================================================
export const createCampaignSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(3),
  description: z.string(),
  type: z.enum(["uang", "mushaf"]),
  targetAmount: z.number().int().positive(),
  endDate: z.string().datetime().optional(),
});

export async function createCampaign(
  input: z.infer<typeof createCampaignSchema>
): Promise<Campaign> {
  const existing = await campaignStore.findById(input.slug);
  if (existing) throw new Error(`Slug "${input.slug}" sudah dipakai.`);

  const campaign: Campaign = {
    id: randomUUID(),
    slug: input.slug,
    title: input.title,
    description: input.description,
    type: input.type,
    targetAmount: input.targetAmount,
    collectedAmount: 0,
    donorCount: 0,
    startDate: nowIso(),
    endDate: input.endDate,
    active: true,
    createdAt: nowIso(),
  };
  return campaignStore.save(campaign);
}

// ==========================================================================
// Tool: list_campaigns
// ==========================================================================
export const listCampaignsSchema = z.object({
  type: z.enum(["uang", "mushaf"]).optional(),
  activeOnly: z.boolean().default(true),
});

export async function listCampaigns(
  input: z.infer<typeof listCampaignsSchema>
): Promise<Campaign[]> {
  let items = await campaignStore.list();
  if (input.type) items = items.filter((c) => c.type === input.type);
  if (input.activeOnly) items = items.filter((c) => c.active);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ==========================================================================
// Tool: get_campaign_progress
// ==========================================================================
export const getCampaignProgressSchema = z.object({
  idOrSlug: z.string(),
});

export async function getCampaignProgress(
  input: z.infer<typeof getCampaignProgressSchema>
): Promise<{
  campaign: Campaign;
  progressPercent: number;
  remainingAmount: number;
  daysRemaining: number | null;
}> {
  const campaign = await campaignStore.findById(input.idOrSlug);
  if (!campaign) throw new Error(`Campaign tidak ditemukan: ${input.idOrSlug}`);
  const progressPercent =
    campaign.targetAmount > 0
      ? Math.min(100, (campaign.collectedAmount / campaign.targetAmount) * 100)
      : 0;
  const remainingAmount = Math.max(
    0,
    campaign.targetAmount - campaign.collectedAmount
  );
  const daysRemaining = campaign.endDate
    ? Math.max(
        0,
        Math.ceil(
          (new Date(campaign.endDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;
  return { campaign, progressPercent, remainingAmount, daysRemaining };
}

// ==========================================================================
// Tool: get_donation_stats
// ==========================================================================
export const getDonationStatsSchema = z.object({
  type: z.enum(["uang", "mushaf"]).optional(),
  since: z.string().datetime().optional(),
});

export async function getDonationStats(
  input: z.infer<typeof getDonationStatsSchema>
): Promise<{
  totalPaidAmount: number;
  totalPaidCount: number;
  totalPendingCount: number;
  totalMushafQuantity: number;
  uniqueDonors: number;
  byStatus: Record<string, number>;
}> {
  let items = await donationStore.list();
  if (input.type) items = items.filter((d) => d.type === input.type);
  if (input.since) items = items.filter((d) => d.createdAt >= input.since!);

  const paid = items.filter((d) => d.status === "paid");
  const totalPaidAmount = paid.reduce((sum, d) => sum + d.amount, 0);
  const totalMushafQuantity = paid
    .filter((d): d is MushafDonation => d.type === "mushaf")
    .reduce((sum, d) => sum + d.quantity, 0);

  const byStatus: Record<string, number> = {};
  for (const d of items) byStatus[d.status] = (byStatus[d.status] || 0) + 1;

  return {
    totalPaidAmount,
    totalPaidCount: paid.length,
    totalPendingCount: items.filter((d) => d.status === "pending").length,
    totalMushafQuantity,
    uniqueDonors: new Set(paid.map((d) => d.donor.email)).size,
    byStatus,
  };
}

// ==========================================================================
// Tool: generate_receipt (text/markdown sederhana)
// ==========================================================================
export const generateReceiptSchema = z.object({
  idOrOrderId: z.string(),
});

export async function generateReceipt(
  input: z.infer<typeof generateReceiptSchema>
): Promise<{ receipt: string; donation: Donation }> {
  const donation = await donationStore.findById(input.idOrOrderId);
  if (!donation) throw new Error(`Donasi tidak ditemukan: ${input.idOrOrderId}`);
  if (donation.status !== "paid") {
    throw new Error("Tanda terima hanya bisa dibuat untuk donasi yang sudah dibayar.");
  }

  const idr = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

  const lines: string[] = [];
  lines.push("# TANDA TERIMA DONASI");
  lines.push("");
  lines.push(`**Order ID:** ${donation.orderId}`);
  lines.push(`**Tanggal Bayar:** ${donation.paidAt}`);
  lines.push(`**Donatur:** ${donation.donor.anonymous ? "Hamba Allah" : donation.donor.name}`);
  lines.push(`**Email:** ${donation.donor.email}`);
  lines.push("");
  if (donation.type === "mushaf") {
    lines.push(`**Jenis Donasi:** Wakaf Mushaf Al-Qur'an`);
    lines.push(`**Jumlah Mushaf:** ${donation.quantity} eksemplar`);
    lines.push(`**Harga Satuan:** ${idr(donation.unitPrice)}`);
  } else {
    lines.push(`**Jenis Donasi:** Donasi Uang`);
  }
  lines.push(`**Total:** ${idr(donation.amount)}`);
  lines.push(`**Metode:** ${donation.paymentMethod || "-"}`);
  if (donation.message) {
    lines.push("");
    lines.push(`**Pesan:** ${donation.message}`);
  }
  lines.push("");
  lines.push("Jazaakumullahu khairan atas donasi Anda.");

  return { receipt: lines.join("\n"), donation };
}
