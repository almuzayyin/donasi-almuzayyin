/**
 * Payment provider logos sebagai inline SVG.
 *
 * Approach: dimensi konsisten (60×24 viewBox), brand colors akurat,
 * simplifikasi yang tetap recognizable. Pakai stylized wordmark — bukan
 * download logo asli — agar:
 *   1. Bebas dari trademark concerns (nominative fair use)
 *   2. Self-contained (no external image files)
 *   3. Crisp di semua DPR (vector)
 *   4. Coloring konsisten per brand
 *
 * Semua logo dirender dalam container 60×24px (rasio 5:2). Background
 * card ditangani parent. Width "auto" via SVG preserveAspectRatio.
 */
import React from "react";

const VIEWBOX = "0 0 60 24";
const COMMON_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: VIEWBOX,
  className: "h-7 sm:h-8 w-auto",
  role: "img" as const,
};

// =========================================================================
// CARDS
// =========================================================================

export function VisaLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="Visa">
      <rect width="60" height="24" rx="3" fill="#1a1f71" />
      <text
        x="30"
        y="18"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="15"
        fontWeight="900"
        fontStyle="italic"
        letterSpacing="0.5"
      >
        VISA
      </text>
      {/* gold accent line khas Visa */}
      <rect x="0" y="22" width="60" height="2" fill="#f7b600" />
    </svg>
  );
}

export function MastercardLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="Mastercard">
      <rect width="60" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      <circle cx="23" cy="12" r="7" fill="#eb001b" />
      <circle cx="34" cy="12" r="7" fill="#f79e1b" />
      <path
        d="M 28.5 6.5 a 7 7 0 0 1 0 11 a 7 7 0 0 1 0 -11 z"
        fill="#ff5f00"
      />
    </svg>
  );
}

export function JcbLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="JCB">
      <rect width="60" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      {/* tiga strip warna khas JCB */}
      <rect x="6" y="4" width="14" height="16" rx="1.5" fill="#005ca1" />
      <rect x="22" y="4" width="14" height="16" rx="1.5" fill="#dc1e2d" />
      <rect x="38" y="4" width="14" height="16" rx="1.5" fill="#057644" />
      {/* "JCB" white text overlay */}
      <text
        x="13"
        y="16"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        J
      </text>
      <text
        x="29"
        y="16"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        C
      </text>
      <text
        x="45"
        y="16"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        B
      </text>
    </svg>
  );
}

// =========================================================================
// BANK TRANSFER (VA)
// =========================================================================

export function BcaLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="BCA">
      <rect width="60" height="24" rx="3" fill="#0066b3" />
      <text
        x="30"
        y="18"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="900"
        letterSpacing="1"
      >
        BCA
      </text>
    </svg>
  );
}

export function MandiriLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="Bank Mandiri">
      <rect width="60" height="24" rx="3" fill="#003d7c" />
      {/* aksen kuning khas Mandiri */}
      <circle cx="11" cy="12" r="2.5" fill="#ffd700" />
      <text
        x="35"
        y="17"
        textAnchor="middle"
        fill="#ffd700"
        fontFamily="Helvetica, Arial, sans-serif"
        fontSize="10"
        fontWeight="700"
      >
        mandiri
      </text>
    </svg>
  );
}

export function BniLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="BNI 46">
      <rect width="60" height="24" rx="3" fill="#005bac" />
      <text
        x="22"
        y="17"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="13"
        fontWeight="900"
        letterSpacing="0.5"
      >
        BNI
      </text>
      {/* "46" subscript orange khas BNI */}
      <text
        x="44"
        y="13"
        textAnchor="middle"
        fill="#ff8200"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="900"
      >
        46
      </text>
    </svg>
  );
}

export function BriLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="BRI">
      <rect width="60" height="24" rx="3" fill="#00529c" />
      <text
        x="30"
        y="18"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="900"
        letterSpacing="1"
      >
        BRI
      </text>
    </svg>
  );
}

// =========================================================================
// E-WALLET
// =========================================================================

export function GoPayLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="GoPay">
      <rect width="60" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      {/* "G" lingkaran biru muda khas GoPay */}
      <circle cx="11" cy="12" r="6" fill="#00aed6" />
      <text
        x="11"
        y="16"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="900"
      >
        g
      </text>
      <text
        x="36"
        y="17"
        textAnchor="middle"
        fill="#00aed6"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="800"
      >
        oPay
      </text>
    </svg>
  );
}

export function OvoLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="OVO">
      <rect width="60" height="24" rx="3" fill="#4c3494" />
      <text
        x="30"
        y="18"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="900"
        letterSpacing="2"
      >
        OVO
      </text>
    </svg>
  );
}

export function DanaLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="DANA">
      <rect width="60" height="24" rx="3" fill="#118eea" />
      <text
        x="30"
        y="17"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="900"
        letterSpacing="1.2"
      >
        DANA
      </text>
    </svg>
  );
}

export function ShopeePayLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="ShopeePay">
      <rect width="60" height="24" rx="3" fill="#ee4d2d" />
      {/* shopping bag icon */}
      <path
        d="M 8 8 L 8 16 L 14 16 L 14 8 M 9 9 L 9 7 a 2 2 0 0 1 4 0 L 13 9"
        fill="none"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text
        x="38"
        y="17"
        textAnchor="middle"
        fill="white"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="800"
      >
        ShopeePay
      </text>
    </svg>
  );
}

// =========================================================================
// QR
// =========================================================================

export function QrisLogo() {
  return (
    <svg {...COMMON_PROPS} aria-label="QRIS">
      <rect width="60" height="24" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.5" />
      {/* mini QR pattern di kiri */}
      <g fill="#231f20">
        {/* pojok kiri-atas */}
        <rect x="5" y="5" width="6" height="6" rx="0.5" />
        <rect x="6.5" y="6.5" width="3" height="3" fill="white" />
        <rect x="7.5" y="7.5" width="1" height="1" fill="#231f20" />
        {/* pojok kiri-bawah */}
        <rect x="5" y="13" width="6" height="6" rx="0.5" />
        <rect x="6.5" y="14.5" width="3" height="3" fill="white" />
        <rect x="7.5" y="15.5" width="1" height="1" fill="#231f20" />
        {/* dot acak */}
        <rect x="13" y="6" width="1.5" height="1.5" />
        <rect x="13" y="10" width="1.5" height="1.5" />
        <rect x="13" y="14" width="1.5" height="1.5" />
        <rect x="13" y="17" width="1.5" height="1.5" />
      </g>
      <text
        x="40"
        y="17"
        textAnchor="middle"
        fill="#e30613"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="900"
        letterSpacing="0.5"
      >
        QRIS
      </text>
    </svg>
  );
}

// =========================================================================
// MIDTRANS (processor badge)
// =========================================================================

export function MidtransLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 80 24"
      className="h-6 w-auto"
      aria-label="Midtrans"
      role="img"
    >
      <rect width="80" height="24" rx="3" fill="#ffffff" stroke="#1976d2" strokeWidth="1" />
      <circle cx="11" cy="12" r="4" fill="#1976d2" />
      <text
        x="46"
        y="17"
        textAnchor="middle"
        fill="#1976d2"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="800"
      >
        midtrans
      </text>
    </svg>
  );
}
