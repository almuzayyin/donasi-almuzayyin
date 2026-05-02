import type { Donation } from "./types.js";

const idr = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n);

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

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

/**
 * Lokal: log ke console saja. Saat deploy, ganti implementasi ini ke
 * Resend/SMTP/Nodemailer. Signature-nya sudah cocok untuk drop-in replacement.
 */
export async function sendEmail(message: EmailMessage): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    // TODO: implementasi Resend saat deploy
    console.log("[email] (TODO Resend)", message.to, message.subject);
    return;
  }
  console.log("\n========= EMAIL (LOCAL DEV) =========");
  console.log("To     :", message.to);
  console.log("Subject:", message.subject);
  console.log("---");
  console.log(message.text);
  console.log("=====================================\n");
}

export async function sendReceiptEmail(donation: Donation): Promise<void> {
  await sendEmail(buildReceiptEmail(donation));
}
