import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { campaignStore, donationStore, reportStore } from "@lib/storage";

export const runtime = "nodejs";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function getPeriodFrom(period?: string): Date | undefined {
  const now = new Date();
  switch (period) {
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "7d":
      return new Date(now.getTime() - 7 * 86400000);
    case "30d":
      return new Date(now.getTime() - 30 * 86400000);
    case "month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "ytd":
      return new Date(now.getFullYear(), 0, 1);
    case "1y":
      return new Date(now.getTime() - 365 * 86400000);
    default:
      return undefined;
  }
}

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? undefined;
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : getPeriodFrom(period);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined;

  const matches = (iso?: string): boolean => {
    if (!from && !to) return true;
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (from && t < from.getTime()) return false;
    if (to && t > to.getTime()) return false;
    return true;
  };

  const [campaigns, donations, reports] = await Promise.all([
    campaignStore.list(),
    donationStore.list(),
    reportStore.list(),
  ]);

  const paid = donations.filter((d) => d.status === "paid" && matches(d.paidAt));
  const filteredReports = reports.filter((r) => matches(r.reportDate));

  const headers = [
    "Program",
    "Slug",
    "Jenis",
    "Target",
    "Terkumpul",
    "Tersalurkan",
    "Saldo",
    "% Tersalurkan",
    "Jumlah Donasi",
    "Donatur Unik",
    "Jumlah Laporan",
  ];

  const rows = campaigns.map((c) => {
    const cDon = paid.filter((d) => d.campaignId === c.id);
    const cRep = filteredReports.filter((r) => r.campaignId === c.id);
    const collected = cDon.reduce((s, d) => s + d.amount, 0);
    const distributed = cRep.reduce((s, r) => s + (r.amountUsed ?? 0), 0);
    const donorCount = new Set(cDon.map((d) => d.donor.email)).size;
    const pct = collected > 0 ? ((distributed / collected) * 100).toFixed(1) : "0.0";
    return [
      c.title,
      c.slug,
      c.type,
      c.targetAmount,
      collected,
      distributed,
      collected - distributed,
      pct + "%",
      cDon.length,
      donorCount,
      cRep.length,
    ];
  });

  // General donations (tanpa campaign)
  const general = paid.filter((d) => !d.campaignId);
  if (general.length > 0) {
    rows.push([
      "Donasi Umum (tanpa program)",
      "",
      "uang",
      0,
      general.reduce((s, d) => s + d.amount, 0),
      0,
      general.reduce((s, d) => s + d.amount, 0),
      "—",
      general.length,
      new Set(general.map((d) => d.donor.email)).size,
      0,
    ]);
  }

  // Grand total
  const grandCollected = paid.reduce((s, d) => s + d.amount, 0);
  const grandDistributed = filteredReports.reduce((s, r) => s + (r.amountUsed ?? 0), 0);
  rows.push([
    "TOTAL",
    "",
    "",
    "",
    grandCollected,
    grandDistributed,
    grandCollected - grandDistributed,
    grandCollected > 0 ? ((grandDistributed / grandCollected) * 100).toFixed(1) + "%" : "0%",
    paid.length,
    new Set(paid.map((d) => d.donor.email)).size,
    filteredReports.length,
  ]);

  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");

  const periodLabel = period ?? "all";
  const filename = `keuangan-${periodLabel}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
