/**
 * Palet: hitam, putih, abu layar, dan biru bertingkat kontras.
 * - Primary #1A6ABF — tombol, tautan (AA ~5.44:1 pada putih)
 * - Strong #1557A0 — teks isi pada permukaan terang (AAA ~7.23:1)
 * - Deep #0D4785 — judul / teks penekanan (AAA ~9.30:1)
 * - Secondary #2E6DB4 — aksi sekunder, label, border lembut (AA ~5.30:1)
 */
export const authColors = {
  white: '#FFFFFF',
  black: '#000000',

  /** Tombol utama, tautan, ikon aksi utama */
  primary: '#1A6ABF',
  /** Teks isi (badan) di atas putih / kartu */
  textBody: '#1557A0',
  /** Judul, nama sesi, angka tegas — kontras tertinggi dalam keluarga biru */
  textDeep: '#0D4785',
  /** Label redup, ikon sekunder, border halus */
  secondary: '#2E6DB4',

  /** Latar layar — abu muda, bukan putih bersih */
  background: '#ECEFF4',
  /** Kartu / input di atas abu */
  surface: '#FFFFFF',

  /** Alias yang dipakai kode lama */
  charcoal: '#0D4785',
  textPrimary: '#1557A0',
  textMuted: '#2E6DB4',

  inputBg: '#FFFFFF',
  /** Border abu terang (kartu, input, garis) */
  border: '#D1D5DB',
  inputBorder: '#D1D5DB',
  placeholder: '#D3D3D3',

  divider: '#E5E7EB',

  accentBlue: '#1A6ABF',
  accentBlueMuted: '#1A6ABF18',

  accentRed: '#000000',
  accentRedMuted: '#0000000C',
} as const;

/** Bayangan untuk kartu di atas latar abu */
export const shadowCard = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 4,
} as const;

export const shadowCardSoft = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2,
} as const;
