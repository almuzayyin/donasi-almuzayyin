import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { campaignStore } from "@lib/storage";
import {
  createMoneyDonation,
  createMushafDonation,
} from "@lib/donations";

export const runtime = "nodejs";

const bodySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("uang"),
    amount: z.number().int().positive().min(1000),
    campaignSlug: z.string().optional(),
    donor: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      anonymous: z.boolean().optional(),
    }),
    message: z.string().max(500).optional(),
  }),
  z.object({
    type: z.literal("mushaf"),
    quantity: z.number().int().positive().max(10000),
    campaignSlug: z.string().optional(),
    donor: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      anonymous: z.boolean().optional(),
    }),
    message: z.string().max(500).optional(),
  }),
]);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.parse(json);

    let campaignId: string | undefined;
    if (parsed.campaignSlug) {
      const c = await campaignStore.findById(parsed.campaignSlug);
      if (c) campaignId = c.id;
    }

    if (parsed.type === "uang") {
      const result = await createMoneyDonation({
        donor: parsed.donor,
        amount: parsed.amount,
        campaignId,
        message: parsed.message,
      });
      return NextResponse.json(result);
    } else {
      const result = await createMushafDonation({
        donor: parsed.donor,
        quantity: parsed.quantity,
        campaignId,
        message: parsed.message,
      });
      return NextResponse.json(result);
    }
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Data tidak valid", details: err.errors },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[/api/donate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
