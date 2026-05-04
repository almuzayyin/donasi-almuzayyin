# Payment Logos

Folder ini untuk menampung **logo asli** payment provider. Komponen
`<PaymentLogo>` di `src/components/PaymentLogo.tsx` akan otomatis
prioritaskan file di sini, dengan fallback ke stylized inline SVG kalau
file belum ada.

## Cara Pakai

Drop file dengan nama slug yang sesuai. Format yang didukung: **SVG**
(prioritas) lalu **PNG**.

| Slug file | Alt | Brand |
|---|---|---|
| `visa.svg` / `visa.png` | Visa | Visa |
| `mastercard.svg` / `.png` | Mastercard | Mastercard |
| `jcb.svg` / `.png` | JCB | JCB |
| `bca.svg` / `.png` | BCA | Bank BCA |
| `mandiri.svg` / `.png` | Bank Mandiri | Bank Mandiri |
| `bni.svg` / `.png` | BNI | Bank BNI |
| `bri.svg` / `.png` | BRI | Bank BRI |
| `gopay.svg` / `.png` | GoPay | Gojek/GoPay |
| `ovo.svg` / `.png` | OVO | OVO |
| `dana.svg` / `.png` | DANA | DANA |
| `shopeepay.svg` / `.png` | ShopeePay | Sea Group / Shopee |
| `qris.svg` / `.png` | QRIS | QRIS Indonesia |

## Sumber Resmi (Brand Asset)

Download dari halaman brand resmi masing-masing provider untuk legal
compliance:

- **Visa**: https://usa.visa.com/run-your-business/small-business-tools/payment-technology/visa-brand-resources.html
- **Mastercard**: https://brand.mastercard.com/brandcenter.html
- **JCB**: https://www.global.jcb/en/about-us/brand-concept/
- **Bank BCA**: minta ke bagian marketing / branch BCA, atau pakai
  asset dari Midtrans Snap UI
- **Bank Mandiri / BNI / BRI**: minta lewat bank resmi atau pakai
  asset Midtrans Snap (lihat bawah)
- **GoPay/Gojek**: https://www.gojek.com/about — Brand Center
- **OVO / DANA / ShopeePay**: kontak partnership masing-masing
- **QRIS**: https://www.aspi-indonesia.or.id/qris/ atau https://qris.id

## Shortcut: Asset Bundle Midtrans

Karena yayasan pakai **Midtrans** sebagai gateway, Midtrans menyediakan
satu set logo lengkap untuk semua channel payment yang mereka support.
Logo-logo ini sudah resmi dan boleh dipakai partner Midtrans:

1. Login ke Dashboard Midtrans
2. Pergi ke **Settings → Payment Channels** atau cek dokumentasi
   "Payment Channel Icons"
3. Atau cek di docs: https://docs.midtrans.com/

Atau cari di: https://github.com/Midtrans/midtrans-php-public-assets
(bila tersedia).

## Spesifikasi Visual

Agar tampilan footer konsisten:

- **Aspect ratio**: ~5:2 (landscape, mis. 60×24 atau 100×40)
- **Background**: transparan (PNG) atau warna brand penuh
- **Padding**: kosongkan ~10% margin di sekitar wordmark
- **Resolution**: SVG (vector, paling baik) atau PNG @2x minimum 96px
  tinggi
- **Color**: pakai brand color resmi, jangan diubah

## Verifikasi

Setelah drop file, restart dev server atau hard refresh production.
Buka footer — logo file di-prefer otomatis. Buka DevTools Network tab,
lihat apakah `/payment-logos/visa.svg` (dst.) memuat 200 OK.
