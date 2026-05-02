import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { donationStore } from "@lib/storage";
import type { MushafDonation } from "@lib/types";

export const runtime = "nodejs";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const q = searchParams.get("q")?.toLowerCase();

  let donations = await donationStore.list();
  if (status) donations = donations.filter((d) => d.status === status);
  if (type) donations = donations.filter((d) => d.type === type);
  if (q) {
    donations = donations.filter(
      (d) =>
        d.orderId.toLowerCase().includes(q) ||
        d.donor.email.toLowerCase().includes(q) ||
        d.donor.name.toLowerCase().includes(q)
    );
  }

  const headers = [
    "Order ID", "Tanggal Dibuat", "Tanggal Bayar", "Status", "Jenis",
    "Nominal", "Quantity Mushaf", "Donatur", "Email", "Telepon",
    "Anonim", "Pesan", "Campaign ID", "Metode Pembayaran",
  ];

  const rows = donations.map((d) => [
    d.orderId,
    d.createdAt,
    d.paidAt ?? "",
    d.status,
    d.type,
    d.amount,
    d.type === "mushaf" ? (d as MushafDonation).quantity : "",
    d.donor.anonymous ? "Hamba Allah" : d.donor.name,
    d.donor.email,
    d.donor.phone ?? "",
    d.donor.anonymous ? "ya" : "tidak",
    d.message ?? "",
    d.campaignId ?? "",
    d.paymentMethod ?? "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  const filename = `donasi-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
