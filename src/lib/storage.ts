import { getSupabaseAdmin, getSupabaseAnon } from "./supabase.js";
import type {
  AppSetting,
  Campaign,
  Donation,
  DonationReport,
  InfoPage,
  MushafDonation,
  PopupMessage,
  ReportExpense,
  ReportPhoto,
} from "./types.js";

interface CampaignRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: "uang" | "mushaf";
  target_amount: number;
  collected_amount: number;
  donor_count: number;
  start_date: string;
  end_date: string | null;
  active: boolean;
  cover_image: string | null;
  created_at: string;
}

interface DonationRow {
  id: string;
  order_id: string;
  type: "uang" | "mushaf";
  campaign_id: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  donor_anonymous: boolean;
  amount: number;
  quantity: number | null;
  unit_price: number | null;
  recipient_name: string | null;
  recipient_address: string | null;
  message: string | null;
  status: Donation["status"];
  payment_url: string | null;
  payment_token: string | null;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  proof_url: string | null;
  is_manual: boolean;
  notes: string | null;
}

const T_CAMPAIGNS = "donasi_campaigns";
const T_DONATIONS = "donasi_donations";
const T_PAYMENT_LOGS = "donasi_payment_logs";
const T_REPORTS = "donasi_reports";
const T_EXPENSES = "donasi_report_expenses";
const T_PAGES = "donasi_pages";
const T_POPUPS = "donasi_popup_messages";
const T_SETTINGS = "donasi_settings";

function rowToCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description,
    type: r.type,
    targetAmount: r.target_amount,
    collectedAmount: r.collected_amount,
    donorCount: r.donor_count,
    startDate: r.start_date,
    endDate: r.end_date ?? undefined,
    active: r.active,
    coverImage: r.cover_image ?? undefined,
    createdAt: r.created_at,
  };
}

function campaignToRow(c: Campaign): CampaignRow {
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description,
    type: c.type,
    target_amount: c.targetAmount,
    collected_amount: c.collectedAmount,
    donor_count: c.donorCount,
    start_date: c.startDate,
    end_date: c.endDate ?? null,
    active: c.active,
    cover_image: c.coverImage ?? null,
    created_at: c.createdAt,
  };
}

function rowToDonation(r: DonationRow): Donation {
  const base = {
    id: r.id,
    orderId: r.order_id,
    campaignId: r.campaign_id ?? undefined,
    donor: {
      name: r.donor_name,
      email: r.donor_email,
      phone: r.donor_phone ?? undefined,
      anonymous: r.donor_anonymous,
    },
    amount: r.amount,
    message: r.message ?? undefined,
    status: r.status,
    paymentUrl: r.payment_url ?? undefined,
    paymentToken: r.payment_token ?? undefined,
    paymentMethod: r.payment_method ?? undefined,
    proofUrl: r.proof_url ?? undefined,
    isManual: r.is_manual ?? false,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    paidAt: r.paid_at ?? undefined,
  };
  if (r.type === "mushaf") {
    return {
      ...base,
      type: "mushaf",
      quantity: r.quantity ?? 0,
      unitPrice: r.unit_price ?? 0,
      recipient:
        r.recipient_name && r.recipient_address
          ? { name: r.recipient_name, address: r.recipient_address }
          : undefined,
    } as MushafDonation;
  }
  return { ...base, type: "uang" } as Donation;
}

function donationToRow(d: Donation): DonationRow {
  const isMushaf = d.type === "mushaf";
  return {
    id: d.id,
    order_id: d.orderId,
    type: d.type,
    campaign_id: d.campaignId ?? null,
    donor_name: d.donor.name,
    donor_email: d.donor.email,
    donor_phone: d.donor.phone ?? null,
    donor_anonymous: d.donor.anonymous ?? false,
    amount: d.amount,
    quantity: isMushaf ? (d as MushafDonation).quantity : null,
    unit_price: isMushaf ? (d as MushafDonation).unitPrice : null,
    recipient_name: isMushaf ? (d as MushafDonation).recipient?.name ?? null : null,
    recipient_address: isMushaf
      ? (d as MushafDonation).recipient?.address ?? null
      : null,
    message: d.message ?? null,
    status: d.status,
    payment_url: d.paymentUrl ?? null,
    payment_token: d.paymentToken ?? null,
    payment_method: d.paymentMethod ?? null,
    paid_at: d.paidAt ?? null,
    created_at: d.createdAt,
    updated_at: d.updatedAt,
    proof_url: d.proofUrl ?? null,
    is_manual: d.isManual ?? false,
    notes: d.notes ?? null,
  };
}

export const campaignStore = {
  async list(): Promise<Campaign[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_CAMPAIGNS)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as CampaignRow[] | null)?.map(rowToCampaign) ?? [];
  },
  async findById(idOrSlug: string): Promise<Campaign | undefined> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_CAMPAIGNS)
      .select("*")
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCampaign(data as CampaignRow) : undefined;
  },
  async save(c: Campaign): Promise<Campaign> {
    const { error } = await getSupabaseAdmin()
      .from(T_CAMPAIGNS)
      .upsert(campaignToRow(c), { onConflict: "id" });
    if (error) throw error;
    return c;
  },
};

/**
 * Read-only store untuk landing page / halaman publik.
 * Pakai anon key + RLS policy "donasi_campaigns_public_read".
 * Tidak butuh SUPABASE_SERVICE_ROLE_KEY.
 */
export const publicCampaignStore = {
  async listActive(): Promise<Campaign[]> {
    const { data, error } = await getSupabaseAnon()
      .from(T_CAMPAIGNS)
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as CampaignRow[] | null)?.map(rowToCampaign) ?? [];
  },
  async findActiveBySlug(slug: string): Promise<Campaign | undefined> {
    const { data, error } = await getSupabaseAnon()
      .from(T_CAMPAIGNS)
      .select("*")
      .eq("slug", slug)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToCampaign(data as CampaignRow) : undefined;
  },
};

export const donationStore = {
  async list(): Promise<Donation[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_DONATIONS)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data as DonationRow[] | null)?.map(rowToDonation) ?? [];
  },
  async findById(idOrOrderId: string): Promise<Donation | undefined> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_DONATIONS)
      .select("*")
      .or(`id.eq.${idOrOrderId},order_id.eq.${idOrOrderId}`)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToDonation(data as DonationRow) : undefined;
  },
  async save(d: Donation): Promise<Donation> {
    const { error } = await getSupabaseAdmin()
      .from(T_DONATIONS)
      .upsert(donationToRow(d), { onConflict: "id" });
    if (error) throw error;
    return d;
  },
};

export const paymentLogStore = {
  async record(
    orderId: string,
    eventType: string,
    payload: unknown,
    signatureValid?: boolean
  ): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from(T_PAYMENT_LOGS)
      .insert({
        order_id: orderId,
        event_type: eventType,
        payload,
        signature_valid: signatureValid ?? null,
        created_at: new Date().toISOString(),
      });
    if (error) throw error;
  },
};

// ==========================================================================
// Reports (Laporan Penyaluran)
// ==========================================================================

interface ReportRow {
  id: string;
  campaign_id: string | null;
  title: string;
  description: string | null;
  amount_used: number | null;
  quantity: number | null;
  report_date: string;
  location: string | null;
  recipient: string | null;
  photos: ReportPhoto[] | null;
  documents: ReportPhoto[] | null;
  published: boolean;
  created_at: string;
  created_by: string | null;
}

interface ExpenseRow {
  id: string;
  report_id: string;
  category: string;
  description: string | null;
  amount: number;
  sort_order: number;
  created_at: string;
}

function rowToReport(r: ReportRow, expenses: ReportExpense[] = []): DonationReport {
  return {
    id: r.id,
    campaignId: r.campaign_id ?? undefined,
    title: r.title,
    description: r.description ?? undefined,
    amountUsed: r.amount_used ?? undefined,
    quantity: r.quantity ?? undefined,
    reportDate: r.report_date,
    location: r.location ?? undefined,
    recipient: r.recipient ?? undefined,
    photos: r.photos ?? [],
    documents: r.documents ?? [],
    published: r.published,
    createdAt: r.created_at,
    createdBy: r.created_by ?? undefined,
    expenses,
  };
}

function rowToExpense(r: ExpenseRow): ReportExpense {
  return {
    id: r.id,
    reportId: r.report_id,
    category: r.category,
    description: r.description ?? undefined,
    amount: r.amount,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

export const reportStore = {
  async list(opts?: { campaignId?: string; limit?: number }): Promise<DonationReport[]> {
    let query = getSupabaseAdmin()
      .from(T_REPORTS)
      .select("*")
      .order("report_date", { ascending: false });
    if (opts?.campaignId) query = query.eq("campaign_id", opts.campaignId);
    if (opts?.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data as ReportRow[] | null)?.map((r) => rowToReport(r)) ?? [];
  },

  async findById(id: string, withExpenses = true): Promise<DonationReport | undefined> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_REPORTS)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    let expenses: ReportExpense[] = [];
    if (withExpenses) {
      const { data: exp } = await getSupabaseAdmin()
        .from(T_EXPENSES)
        .select("*")
        .eq("report_id", id)
        .order("sort_order", { ascending: true });
      expenses = (exp as ExpenseRow[] | null)?.map(rowToExpense) ?? [];
    }
    return rowToReport(data as ReportRow, expenses);
  },

  async save(r: DonationReport): Promise<DonationReport> {
    const { error } = await getSupabaseAdmin()
      .from(T_REPORTS)
      .upsert(
        {
          id: r.id,
          campaign_id: r.campaignId ?? null,
          title: r.title,
          description: r.description ?? null,
          amount_used: r.amountUsed ?? null,
          quantity: r.quantity ?? null,
          report_date: r.reportDate,
          location: r.location ?? null,
          recipient: r.recipient ?? null,
          photos: r.photos ?? [],
          documents: r.documents ?? [],
          published: r.published,
          created_at: r.createdAt,
          created_by: r.createdBy ?? null,
        },
        { onConflict: "id" }
      );
    if (error) throw error;
    return r;
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from(T_REPORTS).delete().eq("id", id);
    if (error) throw error;
  },
};

export const expenseStore = {
  async listByReport(reportId: string): Promise<ReportExpense[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_EXPENSES)
      .select("*")
      .eq("report_id", reportId)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    return (data as ExpenseRow[] | null)?.map(rowToExpense) ?? [];
  },

  async replaceAll(reportId: string, expenses: Omit<ReportExpense, "id" | "reportId" | "createdAt">[]): Promise<void> {
    const supabase = getSupabaseAdmin();
    // Hapus semua dulu, lalu insert baru (lebih simple daripada diff)
    await supabase.from(T_EXPENSES).delete().eq("report_id", reportId);
    if (expenses.length === 0) return;
    const now = new Date().toISOString();
    const rows = expenses.map((e, idx) => ({
      id: crypto.randomUUID(),
      report_id: reportId,
      category: e.category,
      description: e.description ?? null,
      amount: e.amount,
      sort_order: e.sortOrder ?? idx,
      created_at: now,
    }));
    const { error } = await supabase.from(T_EXPENSES).insert(rows);
    if (error) throw error;
  },
};

// Public read-only store untuk halaman /transparansi (anon RLS)
// Public donation feed (sanitized for popup notifikasi & social proof)
export interface PublicDonationItem {
  donor: string;
  amount: number;
  campaign: string | null;
  paidAt: string;
  type: "uang" | "mushaf";
}

function sanitizeDonorName(name: string, anonymous: boolean): string {
  if (anonymous) return "Hamba Allah";
  // Privacy: tampilkan nama depan + inisial nama belakang
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export const publicDonationFeed = {
  async listRecent(limit: number = 20): Promise<PublicDonationItem[]> {
    const supabase = getSupabaseAdmin();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from(T_DONATIONS)
      .select("donor_name, donor_anonymous, amount, type, paid_at, campaign_id")
      .eq("status", "paid")
      .gte("paid_at", cutoff)
      .order("paid_at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    const campaigns = await getSupabaseAdmin().from(T_CAMPAIGNS).select("id, title");
    const campaignMap = new Map((campaigns.data ?? []).map((c: any) => [c.id, c.title]));

    return (data ?? []).map((r: any) => ({
      donor: sanitizeDonorName(r.donor_name, r.donor_anonymous),
      amount: r.amount,
      campaign: r.campaign_id ? campaignMap.get(r.campaign_id) ?? null : null,
      paidAt: r.paid_at,
      type: r.type,
    }));
  },

  async listSince(sinceIso: string): Promise<PublicDonationItem[]> {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(T_DONATIONS)
      .select("donor_name, donor_anonymous, amount, type, paid_at, campaign_id")
      .eq("status", "paid")
      .gt("paid_at", sinceIso)
      .order("paid_at", { ascending: false })
      .limit(50);
    if (error) throw error;

    const campaigns = await getSupabaseAdmin().from(T_CAMPAIGNS).select("id, title");
    const campaignMap = new Map((campaigns.data ?? []).map((c: any) => [c.id, c.title]));

    return (data ?? []).map((r: any) => ({
      donor: sanitizeDonorName(r.donor_name, r.donor_anonymous),
      amount: r.amount,
      campaign: r.campaign_id ? campaignMap.get(r.campaign_id) ?? null : null,
      paidAt: r.paid_at,
      type: r.type,
    }));
  },
};

export const publicReportStore = {
  async listPublished(opts?: { campaignId?: string; limit?: number }): Promise<DonationReport[]> {
    let query = getSupabaseAnon()
      .from(T_REPORTS)
      .select("*")
      .eq("published", true)
      .order("report_date", { ascending: false });
    if (opts?.campaignId) query = query.eq("campaign_id", opts.campaignId);
    if (opts?.limit) query = query.limit(opts.limit);
    const { data, error } = await query;
    if (error) throw error;
    return (data as ReportRow[] | null)?.map((r) => rowToReport(r)) ?? [];
  },

  async findPublishedById(id: string): Promise<DonationReport | undefined> {
    const { data, error } = await getSupabaseAnon()
      .from(T_REPORTS)
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    const { data: exp } = await getSupabaseAnon()
      .from(T_EXPENSES)
      .select("*")
      .eq("report_id", id)
      .order("sort_order", { ascending: true });
    const expenses = (exp as ExpenseRow[] | null)?.map(rowToExpense) ?? [];
    return rowToReport(data as ReportRow, expenses);
  },

  async sumDistributedByCampaign(campaignId: string): Promise<number> {
    const { data, error } = await getSupabaseAnon()
      .from(T_REPORTS)
      .select("amount_used")
      .eq("campaign_id", campaignId)
      .eq("published", true);
    if (error) throw error;
    return (data ?? []).reduce((s, r) => s + (Number(r.amount_used) || 0), 0);
  },
};

// ==========================================================================
// Halaman Legal/Info (CMS Sederhana)
// ==========================================================================

interface PageRow {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
  published: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

function rowToPage(r: PageRow): InfoPage {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    content: r.content,
    metaDescription: r.meta_description ?? undefined,
    published: r.published,
    isSystem: r.is_system,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by ?? undefined,
  };
}

export const pageStore = {
  async list(): Promise<InfoPage[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_PAGES)
      .select("*")
      .order("title", { ascending: true });
    if (error) throw error;
    return (data as PageRow[] | null)?.map(rowToPage) ?? [];
  },

  async findById(idOrSlug: string): Promise<InfoPage | undefined> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_PAGES)
      .select("*")
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPage(data as PageRow) : undefined;
  },

  async save(p: InfoPage): Promise<InfoPage> {
    const { error } = await getSupabaseAdmin()
      .from(T_PAGES)
      .upsert(
        {
          id: p.id,
          slug: p.slug,
          title: p.title,
          content: p.content,
          meta_description: p.metaDescription ?? null,
          published: p.published,
          is_system: p.isSystem,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
          updated_by: p.updatedBy ?? null,
        },
        { onConflict: "id" }
      );
    if (error) throw error;
    return p;
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from(T_PAGES).delete().eq("id", id);
    if (error) throw error;
  },
};

export const publicPageStore = {
  async findBySlug(slug: string): Promise<InfoPage | undefined> {
    const { data, error } = await getSupabaseAnon()
      .from(T_PAGES)
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPage(data as PageRow) : undefined;
  },
};

// ==========================================================================
// Popup Messages (Manual popup untuk social proof)
// ==========================================================================

interface PopupRow {
  id: string;
  donor_name: string;
  donor_location: string | null;
  amount: number | null;
  campaign_id: string | null;
  type: "uang" | "mushaf";
  custom_message: string | null;
  display_at: string;
  show_until: string | null;
  active: boolean;
  created_at: string;
  created_by: string | null;
}

function rowToPopup(r: PopupRow): PopupMessage {
  return {
    id: r.id,
    donorName: r.donor_name,
    donorLocation: r.donor_location ?? undefined,
    amount: r.amount ?? undefined,
    campaignId: r.campaign_id ?? undefined,
    type: r.type,
    customMessage: r.custom_message ?? undefined,
    displayAt: r.display_at,
    showUntil: r.show_until ?? undefined,
    active: r.active,
    createdAt: r.created_at,
    createdBy: r.created_by ?? undefined,
  };
}

export const popupStore = {
  async list(): Promise<PopupMessage[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_POPUPS)
      .select("*")
      .order("display_at", { ascending: false });
    if (error) throw error;
    return (data as PopupRow[] | null)?.map(rowToPopup) ?? [];
  },

  async findById(id: string): Promise<PopupMessage | undefined> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_POPUPS)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToPopup(data as PopupRow) : undefined;
  },

  async save(p: PopupMessage): Promise<PopupMessage> {
    const { error } = await getSupabaseAdmin()
      .from(T_POPUPS)
      .upsert(
        {
          id: p.id,
          donor_name: p.donorName,
          donor_location: p.donorLocation ?? null,
          amount: p.amount ?? null,
          campaign_id: p.campaignId ?? null,
          type: p.type,
          custom_message: p.customMessage ?? null,
          display_at: p.displayAt,
          show_until: p.showUntil ?? null,
          active: p.active,
          created_at: p.createdAt,
          created_by: p.createdBy ?? null,
        },
        { onConflict: "id" }
      );
    if (error) throw error;
    return p;
  },

  async delete(id: string): Promise<void> {
    const { error } = await getSupabaseAdmin().from(T_POPUPS).delete().eq("id", id);
    if (error) throw error;
  },
};

// Public read-only — pakai anon dengan RLS filter (active=true & not expired)
export const publicPopupStore = {
  async listActive(limit: number = 30): Promise<PopupMessage[]> {
    const { data, error } = await getSupabaseAnon()
      .from(T_POPUPS)
      .select("*")
      .eq("active", true)
      .order("display_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data as PopupRow[] | null)?.map(rowToPopup) ?? [];
  },
};

// ==========================================================================
// Settings (Konfigurasi App — editable via /admin/settings)
// ==========================================================================

interface SettingRow {
  key: string;
  value: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
}

function rowToSetting(r: SettingRow): AppSetting {
  return {
    key: r.key,
    value: r.value,
    description: r.description ?? undefined,
    isPublic: r.is_public,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by ?? undefined,
  };
}

export const settingsStore = {
  async list(): Promise<AppSetting[]> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_SETTINGS)
      .select("*")
      .order("key", { ascending: true });
    if (error) throw error;
    return (data as SettingRow[] | null)?.map(rowToSetting) ?? [];
  },

  async get(key: string): Promise<string | null> {
    const { data, error } = await getSupabaseAdmin()
      .from(T_SETTINGS)
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return data?.value ?? null;
  },

  async getInt(key: string, fallback: number): Promise<number> {
    try {
      const v = await this.get(key);
      const n = v ? parseInt(v, 10) : NaN;
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  },

  async set(key: string, value: string, by?: string): Promise<void> {
    const { error } = await getSupabaseAdmin()
      .from(T_SETTINGS)
      .upsert(
        {
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: by ?? null,
        },
        { onConflict: "key" }
      );
    if (error) throw error;
  },
};

export const publicSettingsStore = {
  async get(key: string): Promise<string | null> {
    const { data, error } = await getSupabaseAnon()
      .from(T_SETTINGS)
      .select("value")
      .eq("key", key)
      .eq("is_public", true)
      .maybeSingle();
    if (error) return null;
    return data?.value ?? null;
  },

  async getInt(key: string, fallback: number): Promise<number> {
    const v = await this.get(key);
    const n = v ? parseInt(v, 10) : NaN;
    return Number.isFinite(n) ? n : fallback;
  },
};
