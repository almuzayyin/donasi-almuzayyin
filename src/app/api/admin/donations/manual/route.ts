import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin-auth";
import { donationStore, campaignStore, settingsStore } from "@lib/storage";
import { sendReceiptEmail } from "@lib/email";

export const runtime = "nodejs";

const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uang"),
    campaignId: z.string().optional(),
    donor: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      anonymous: z.boolean().optional(),
    }),
    amount: z.number().int().positive().min(1000),
    paymentMethod: z.string(),
    paidAt: z.string(),
    notes: z.string().optional(),
    proofUrl: z.string().url().optional(),
  }),
  z.object({
    type: z.literal("mushaf"),
    campaignId: z.string().optional(),
    donor: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      anonymous: z.boolean().optional(),
    }),
    quantity: z.number().int().positive(),
    paymentMethod: z.string(),
    paidAt: z.string(),
    notes: z.string().optional(),
    proofUrl: z.string().url().optional(),
  }),
]);

function makeOrderId(): string {
  return `MNL-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const now = new Date().toISOString();
    const id = randomUUID();
    const orderId = makeOrderId();

    const mushafPrice = await settingsStore.getInt("mushaf_unit_price", 85_000);
    const amount = body.type === "uang" ? body.amount : body.quantity * mushafPrice;

    const baseDonation = {
      id,
      orderId,
      campaignId: body.campaignId,
      donor: body.donor,
      amount,
      status: "paid" as const,
      paymentMethod: body.paymentMethod,
      proofUrl: body.proofUrl,
      isManual: true,
      notes: body.notes,
      createdAt: now,
      updatedAt: now,
      paidAt: body.paidAt,
    };

    const donation = body.type === "mushaf"
      ? { ...baseDonation, type: "mushaf" as const, quantity: body.quantity, unitPrice: mushafPrice }
      : { ...baseDonation, type: "uang" as const };

    await donationStore.save(donation);

    // Update campaign aggregate
    if (body.campaignId) {
      const campaign = await campaignStore.findById(body.campaignId);
      if (campaign) {
        const allPaid = (await donationStore.list()).filter(
          (d) => d.campaignId === campaign.id && d.status === "paid"
        );
        campaign.collectedAmount = allPaid.reduce((s, d) => s + d.amount, 0);
        campaign.donorCount = allPaid.length;
        await campaignStore.save(campaign);
      }
    }

    // Kirim email tanda terima (kalau gagal, jangan rollback transaksi)
    sendReceiptEmail(donation).catch((err) =>
      console.error("[manual donation] email gagal:", err)
    );

    return NextResponse.json({ ok: true, donation });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: err.errors }, { status: 400 });
    }
    console.error("[POST /api/admin/donations/manual]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal" }, { status: 500 });
  }
}
