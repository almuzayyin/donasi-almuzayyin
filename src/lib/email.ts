import { settingsStore } from "./storage.js";
import type { Donation } from "./types.js";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  from?: string;
}

// =============================================================================
// Builders
// =============================================================================

export function buildReceiptEmail(donation: Donation): EmailMessage {
  const donorName = donation.donor.anonymous ? "Hamba Allah" : donation.donor.name;
  const isMushaf = donation.type === "mushaf";

  const subject = `Tanda Terima Donasi - ${donation.orderId}`;
  const text = [
    `Assalamu'alaikum ${donorName},`,
    "",
    `Kami telah menerima donasi Anda. Berikut detailnya:`,
    "",
    `Order ID    : ${donation.orderId}`,
    `Jenis       : ${isMushaf ? "Wakaf Mushaf" : "Donasi Uang"}`,
    isMushaf ? `Mushaf      : ${(donation as any).quantity} eksemplar` : "",
    `Total       : ${idr(donation.amount)}`,
    `Tanggal     : ${donation.paidAt ?? donation.updatedAt}`,
    `Metode      : ${donation.paymentMethod ?? "-"}`,
    "",
    `Jazaakumullahu khairan atas donasinya.`,
    `Semoga menjadi amal jariyah yang menerangi.`,
    "",
    `Yayasan Islam Al Muzayyin Gadung`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
      <h2 style="color:#0f5132;margin:0 0 16px">Tanda Terima Donasi</h2>
      <p>Assalamu'alaikum <strong>${donorName}</strong>,</p>
      <p>Kami telah menerima donasi Anda. Berikut detailnya:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Order ID</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${donation.orderId}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Jenis</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${isMushaf ? "Wakaf Mushaf" : "Donasi Uang"}</td></tr>
        ${isMushaf ? `<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Jumlah</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${(donation as any).quantity} eksemplar</td></tr>` : ""}
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Total</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${idr(donation.amount)}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e2e8f0"><strong>Tanggal</strong></td><td style="padding:8px;border-bottom:1px solid #e2e8f0">${donation.paidAt ?? donation.updatedAt}</td></tr>
        <tr><td style="padding:8px"><strong>Metode</strong></td><td style="padding:8px">${donation.paymentMethod ?? "-"}</td></tr>
      </table>
      <p>Jazaakumullahu khairan atas donasinya.<br>Semoga menjadi amal jariyah yang menerangi.</p>
      <p style="margin-top:24px;color:#475569;font-size:13px">— Yayasan Islam Al Muzayyin Gadung</p>
    </div>
  `.trim();

  return { to: donation.donor.email, subject, text, html };
}

export function buildAdminNotificationEmail(donation: Donation, to: string): EmailMessage {
  const donorName = donation.donor.anonymous ? "Hamba Allah" : donation.donor.name;
  const isMushaf = donation.type === "mushaf";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yayasanislamalmuzayin.com";

  const subject = `🎉 Donasi Masuk - ${donorName} - ${idr(donation.amount)}`;
  const text = [
    `Donasi baru masuk!`,
    "",
    `Donatur     : ${donorName}`,
    `Email       : ${donation.donor.email}`,
    `Telepon     : ${donation.donor.phone ?? "-"}`,
    `Jenis       : ${isMushaf ? `Wakaf Mushaf (${(donation as any).quantity} eksemplar)` : "Donasi Uang"}`,
    `Total       : ${idr(donation.amount)}`,
    `Tanggal     : ${donation.paidAt ?? donation.updatedAt}`,
    `Metode      : ${donation.paymentMethod ?? "-"}`,
    `Order ID    : ${donation.orderId}`,
    donation.message ? `Pesan       : ${donation.message}` : "",
    "",
    `Lihat detail: ${siteUrl}/admin/donations/${donation.orderId}`,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="background:#0f5132;color:white;padding:16px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">🎉 Donasi Masuk</h2>
        <p style="margin:4px 0 0;opacity:0.9">${idr(donation.amount)}${isMushaf ? ` · ${(donation as any).quantity} mushaf` : ""}</p>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:16px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Donatur</td><td style="padding:6px 0;font-weight:600">${donorName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Email</td><td style="padding:6px 0">${donation.donor.email}</td></tr>
          ${donation.donor.phone ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">Telepon</td><td style="padding:6px 0">${donation.donor.phone}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Jenis</td><td style="padding:6px 0">${isMushaf ? `Wakaf Mushaf (${(donation as any).quantity} eksemplar)` : "Donasi Uang"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Tanggal</td><td style="padding:6px 0">${donation.paidAt ?? donation.updatedAt}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Metode</td><td style="padding:6px 0">${donation.paymentMethod ?? "-"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Order ID</td><td style="padding:6px 0;font-family:monospace;font-size:12px">${donation.orderId}</td></tr>
          ${donation.message ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;vertical-align:top">Pesan</td><td style="padding:6px 0;font-style:italic">${donation.message}</td></tr>` : ""}
        </table>
        <p style="margin-top:16px">
          <a href="${siteUrl}/admin/donations/${donation.orderId}" style="background:#0f5132;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;font-size:14px">Lihat Detail</a>
        </p>
      </div>
      <p style="margin-top:24px;color:#94a3b8;font-size:12px;text-align:center">Email otomatis dari sistem donasi Yayasan Al Muzayyin</p>
    </div>
  `.trim();

  return { to, subject, text, html };
}

// =============================================================================
// Sender (Resend production / console.log dev)
// =============================================================================

const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendViaResend(message: EmailMessage): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY tidak di-set");

  const fromEnv = process.env.EMAIL_FROM || "Yayasan Al Muzayyin <onboarding@resend.dev>";
  const from = message.from || fromEnv;

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend API error ${res.status}: ${errorText}`);
  }
}

export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    try {
      await sendViaResend(message);
      console.log("[email] sent via Resend:", message.to, message.subject);
    } catch (err) {
      console.error("[email] Resend failed:", err);
      throw err;
    }
    return;
  }
  // Local dev fallback — log ke console
  console.log("\n========= EMAIL (LOCAL DEV) =========");
  console.log("To     :", message.to);
  console.log("Subject:", message.subject);
  console.log("---");
  console.log(message.text);
  console.log("=====================================\n");
}

// =============================================================================
// Public helpers
// =============================================================================

export async function sendReceiptEmail(donation: Donation): Promise<void> {
  await sendEmail(buildReceiptEmail(donation));
}

/**
 * Kirim notifikasi ke email yayasan saat ada donasi paid.
 * Email tujuan dari setting `notification_email` (DB-backed).
 * Kalau setting kosong, fallback ke env NOTIFICATION_EMAIL, lalu skip.
 */
export async function sendAdminNotificationEmail(donation: Donation): Promise<void> {
  let to: string | null = null;
  try {
    to = await settingsStore.get("notification_email");
  } catch (err) {
    console.warn("[email] failed to read notification_email setting:", err);
  }
  if (!to) to = process.env.NOTIFICATION_EMAIL ?? null;
  if (!to) {
    console.log("[email] notification_email belum di-set — skip admin notif");
    return;
  }
  await sendEmail(buildAdminNotificationEmail(donation, to));
}
