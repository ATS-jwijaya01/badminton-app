export type GameSessionRow = {
  id: string;
  name: string;
  /** ISO date string */
  dateIso: string;
  matchCount: number;
  playerCount: number;
};

/** Ringkasan agregat (nanti dari API) */
export const mockPlayerSummary = {
  /** Total permainan (match) yang pernah dimainkan */
  totalMatches: 142,
  menang: 28,
  kalah: 15,
  point: 4520,
};

export const mockSessions: GameSessionRow[] = [
  {
    id: '1',
    name: 'Sesi Sabtu Pagi — GOR Senayan',
    dateIso: '2026-04-12T08:00:00',
    matchCount: 6,
    playerCount: 12,
  },
  {
    id: '2',
    name: 'Latihan rutin pekan',
    dateIso: '2026-04-10T19:30:00',
    matchCount: 4,
    playerCount: 8,
  },
  {
    id: '3',
    name: 'Turnamen internal kantor',
    dateIso: '2026-04-06T14:00:00',
    matchCount: 9,
    playerCount: 16,
  },
  {
    id: '4',
    name: 'Main malam weekday',
    dateIso: '2026-04-03T20:00:00',
    matchCount: 5,
    playerCount: 10,
  },
  {
    id: '5',
    name: 'Sesi Minggu — double campuran',
    dateIso: '2026-03-30T07:00:00',
    matchCount: 7,
    playerCount: 14,
  },
  {
    id: '6',
    name: 'Sparring level menengah',
    dateIso: '2026-03-22T18:00:00',
    matchCount: 3,
    playerCount: 6,
  },
  {
    id: '7',
    name: 'Fun game weekend',
    dateIso: '2026-03-15T09:00:00',
    matchCount: 8,
    playerCount: 12,
  },
];

export function winRatePercent(menang: number, kalah: number): number {
  const total = menang + kalah;
  if (total === 0) return 0;
  return Math.round((menang / total) * 100);
}

export function formatSessionDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Pertandingan ganda terakhir (untuk beranda) */
export type RecentDoublesMatch = {
  id: string;
  dateIso: string;
  won: boolean;
  scoreUs: number;
  scoreThem: number;
  partnerName: string;
  opponentNames: [string, string];
};

export const mockRecentMatches: RecentDoublesMatch[] = [
  {
    id: 'm1',
    dateIso: '2026-04-12T10:30:00',
    won: false,
    scoreUs: 10,
    scoreThem: 22,
    partnerName: 'Budi',
    opponentNames: ['Rina', 'Dedi'],
  },
  {
    id: 'm2',
    dateIso: '2026-04-11T19:00:00',
    won: true,
    scoreUs: 21,
    scoreThem: 18,
    partnerName: 'Sari',
    opponentNames: ['Ahmad', 'Lina'],
  },
  {
    id: 'm3',
    dateIso: '2026-04-09T08:15:00',
    won: true,
    scoreUs: 21,
    scoreThem: 15,
    partnerName: 'Yoga',
    opponentNames: ['Maya', 'Tono'],
  },
  {
    id: 'm4',
    dateIso: '2026-04-07T20:00:00',
    won: false,
    scoreUs: 12,
    scoreThem: 21,
    partnerName: 'Citra',
    opponentNames: ['Wawan', 'Putri'],
  },
  {
    id: 'm5',
    dateIso: '2026-04-05T07:45:00',
    won: true,
    scoreUs: 21,
    scoreThem: 19,
    partnerName: 'Eko',
    opponentNames: ['Nina', 'Rizki'],
  },
];
