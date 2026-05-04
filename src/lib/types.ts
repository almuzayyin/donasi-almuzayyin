export type DonationType = "uang" | "mushaf";

export type DonationStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "failed"
  | "refunded";

export interface Donor {
  name: string;
  email: string;
  phone?: string;
  anonymous?: boolean;
}

export interface BaseDonation {
  id: string;
  orderId: string;
  type: DonationType;
  campaignId?: string;
  donor: Donor;
  amount: number;
  message?: string;
  status: DonationStatus;
  paymentUrl?: string;
  paymentToken?: string;
  paymentMethod?: string;
  proofUrl?: string;
  isManual?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
}

export interface MoneyDonation extends BaseDonation {
  type: "uang";
}

export interface MushafDonation extends BaseDonation {
  type: "mushaf";
  quantity: number;
  unitPrice: number;
  recipient?: {
    name: string;
    address: string;
  };
}

export type Donation = MoneyDonation | MushafDonation;

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: DonationType;
  targetAmount: number;
  collectedAmount: number;
  donorCount: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  coverImage?: string;
  createdAt: string;
}

export interface AppSetting {
  key: string;
  value: string;
  description?: string;
  isPublic: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface PopupMessage {
  id: string;
  donorName: string;
  donorLocation?: string;
  amount?: number;
  campaignId?: string;
  type: "uang" | "mushaf";
  customMessage?: string;
  displayAt: string;
  showUntil?: string;
  active: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface InfoPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription?: string;
  published: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface ReportPhoto {
  url: string;
  caption?: string;
}

export interface ReportExpense {
  id: string;
  reportId: string;
  category: string;
  description?: string;
  amount: number;
  sortOrder: number;
  createdAt: string;
}

export interface DonationReport {
  id: string;
  campaignId?: string;
  title: string;
  description?: string;
  amountUsed?: number;
  quantity?: number;
  reportDate: string;
  location?: string;
  recipient?: string;
  photos: ReportPhoto[];
  documents: ReportPhoto[];
  published: boolean;
  createdAt: string;
  createdBy?: string;
  expenses?: ReportExpense[];
}

export type GalleryCategory =
  | "tahfidz"
  | "santunan"
  | "pembangunan"
  | "pengajian"
  | "wakaf"
  | "dokumentasi"
  | "umum";

export interface Gallery {
  id: string;
  title: string;
  description?: string;
  category: GalleryCategory;
  imageUrl: string;
  caption?: string;
  takenAt?: string;
  location?: string;
  sortOrder: number;
  published: boolean;
  isDocument: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface PaymentNotification {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
  payment_type?: string;
  gross_amount?: string;
  signature_key?: string;
  status_code?: string;
  transaction_id?: string;
  transaction_time?: string;
}
