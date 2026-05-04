/**
 * Payment methods footer section.
 *
 * Pakai inline SVG logos (lihat ./payment-logos.tsx) dengan brand colors
 * akurat. Dikelompokkan per tipe untuk hierarchy: Kartu / Transfer Bank /
 * E-Wallet / QR Code.
 */
import PaymentLogo from "./PaymentLogo";
import {
  BcaLogo,
  BniLogo,
  BriLogo,
  DanaLogo,
  GoPayLogo,
  JcbLogo,
  MandiriLogo,
  MastercardLogo,
  MidtransLogo,
  OvoLogo,
  QrisLogo,
  ShopeePayLogo,
  VisaLogo,
} from "./payment-logos";

interface GroupProps {
  label: string;
  children: React.ReactNode;
}

function Group({ label, children }: GroupProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">{children}</div>
    </div>
  );
}

export default function PaymentMethods() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-5">
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 whitespace-nowrap">
          🔒 Pembayaran Aman & Tepercaya
        </p>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span>Diproses oleh</span>
          <PaymentLogo slug="midtrans" alt="Midtrans" variant="lg"><MidtransLogo /></PaymentLogo>
          <span className="hidden sm:inline">— PCI DSS Level 1 Certified</span>
        </div>
      </div>

      {/* Grouped logo grid — pakai logo asli dari /public/payment-logos/
          dengan fallback stylized SVG (children) kalau file belum di-drop.
          Children pattern dipakai biar React element serializable lewat
          Server → Client component boundary. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <Group label="Kartu">
          <PaymentLogo slug="visa" alt="Visa"><VisaLogo /></PaymentLogo>
          <PaymentLogo slug="mastercard" alt="Mastercard"><MastercardLogo /></PaymentLogo>
          <PaymentLogo slug="jcb" alt="JCB"><JcbLogo /></PaymentLogo>
        </Group>

        <Group label="Transfer Bank">
          <PaymentLogo slug="bca" alt="BCA"><BcaLogo /></PaymentLogo>
          <PaymentLogo slug="mandiri" alt="Bank Mandiri"><MandiriLogo /></PaymentLogo>
          <PaymentLogo slug="bni" alt="BNI"><BniLogo /></PaymentLogo>
          <PaymentLogo slug="bri" alt="BRI"><BriLogo /></PaymentLogo>
        </Group>

        <Group label="E-Wallet">
          <PaymentLogo slug="gopay" alt="GoPay"><GoPayLogo /></PaymentLogo>
          <PaymentLogo slug="ovo" alt="OVO"><OvoLogo /></PaymentLogo>
          <PaymentLogo slug="dana" alt="DANA"><DanaLogo /></PaymentLogo>
          <PaymentLogo slug="shopeepay" alt="ShopeePay"><ShopeePayLogo /></PaymentLogo>
        </Group>

        <Group label="QR Code">
          <PaymentLogo slug="qris" alt="QRIS"><QrisLogo /></PaymentLogo>
        </Group>
      </div>

      {/* Disclaimer */}
      <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">
        Semua transaksi <strong className="text-slate-700">dienkripsi end-to-end</strong>.
        Data kartu kredit tidak pernah disimpan di server kami. Tanda terima donasi
        otomatis dikirim via email setelah pembayaran sukses.
      </p>
    </div>
  );
}
