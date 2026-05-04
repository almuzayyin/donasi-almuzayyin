/**
 * Payment methods badge dengan brand colors akurat, dikelompokkan per tipe.
 *
 * Pendekatan: text badge berwarna brand (no SVG trademark) — ringan, scalable,
 * dan tetap recognizable. Cocok untuk "we accept these" indication
 * (nominative fair use).
 */
import React from "react";

interface BadgeProps {
  bg: string;
  fg?: string;
  bold?: boolean;
  italic?: boolean;
  children: React.ReactNode;
}

function Badge({ bg, fg = "white", bold = true, italic, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md text-[10px] sm:text-[11px] tracking-wide px-2.5 py-1.5 shadow-sm border ${
        bold ? "font-bold" : "font-semibold"
      } ${italic ? "italic" : ""}`}
      style={{
        background: bg,
        color: fg,
        borderColor: "rgba(0,0,0,0.08)",
        minWidth: "60px",
      }}
    >
      {children}
    </span>
  );
}

interface GroupProps {
  label: string;
  children: React.ReactNode;
}

function Group({ label, children }: GroupProps) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export default function PaymentMethods() {
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-4">
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          🔒 Pembayaran Aman & Tepercaya
        </p>
        <p className="text-[11px] text-slate-500">
          Diproses oleh{" "}
          <span
            className="inline-flex items-center gap-1 font-semibold"
            style={{ color: "#1976d2" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
            Midtrans
          </span>
          {" "}— PCI DSS Level 1 Certified
        </p>
      </div>

      {/* Grouped badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <Group label="Kartu">
          {/* Visa — biru kepresidenan dengan emas signature */}
          <Badge bg="#1a1f71" italic>VISA</Badge>
          {/* Mastercard — gradient red+yellow */}
          <Badge bg="linear-gradient(90deg, #eb001b 0%, #eb001b 50%, #f79e1b 50%, #f79e1b 100%)">
            <span className="text-[10px]">MasterCard</span>
          </Badge>
          {/* JCB — biru/merah/hijau (sederhanakan ke navy) */}
          <Badge bg="#0e4c92">JCB</Badge>
        </Group>

        <Group label="Transfer Bank">
          {/* BCA — biru */}
          <Badge bg="#0066b3">BCA</Badge>
          {/* Mandiri — kuning navy */}
          <Badge bg="#003d7c" fg="#ffd700">Mandiri</Badge>
          {/* BNI — orange */}
          <Badge bg="#ed8002">BNI</Badge>
          {/* BRI — biru langit */}
          <Badge bg="#00529c">BRI</Badge>
        </Group>

        <Group label="E-Wallet">
          {/* GoPay — biru muda */}
          <Badge bg="#00aed6">GoPay</Badge>
          {/* OVO — ungu */}
          <Badge bg="#4c3494">OVO</Badge>
          {/* DANA — biru cerah */}
          <Badge bg="#118eea">DANA</Badge>
          {/* ShopeePay — orange */}
          <Badge bg="#ee4d2d">ShopeePay</Badge>
        </Group>

        <Group label="QR Code">
          {/* QRIS — merah-orange */}
          <Badge bg="#ed1b24">QRIS</Badge>
        </Group>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
        Semua transaksi <strong>dienkripsi end-to-end</strong>. Data kartu kredit tidak
        pernah disimpan di server kami. Tanda terima donasi otomatis dikirim via email
        setelah pembayaran sukses.
      </p>
    </div>
  );
}
