import { useCallback, useEffect, useReducer, useMemo } from 'react';

export type MatchFormat = 'singles' | 'doubles';

/** Expo Router params kadang `string[]` — kunci Map harus string tunggal. */
export function normalizeSessionId(
  id: string | string[] | undefined | null,
): string {
  if (id === null || id === undefined) return 'default-session';
  const v = Array.isArray(id) ? id[0] : id;
  if (v === undefined || v === null || v === '') return 'default-session';
  const s = String(v).trim();
  return s.length > 0 ? s : 'default-session';
}

export type GridSlot = 'tl' | 'tr' | 'bl' | 'br';

export type SessionMatch = {
  id: string;
  format: MatchFormat;
  /** 1-based court index within session */
  courtNumber: number;
  homePlayerOneId: string;
  homePlayerTwoId: string | null;
  awayPlayerOneId: string;
  awayPlayerTwoId: string | null;
  homeScore: string;
  awayScore: string;
  /** 2×2 lapangan: pemain per sel (id pemain atau kosong) */
  gridSlots: Record<GridSlot, string | null>;
  /** Servis milik sisi */
  serveSide: 'home' | 'away';
};

type SetMatchesInput =
  | SessionMatch[]
  | ((prev: SessionMatch[]) => SessionMatch[]);

type Listener = () => void;
const listeners = new Set<Listener>();
const data = new Map<string, SessionMatch[]>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeSessionMatches(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSessionMatches(sessionId: string | string[] | undefined | null): SessionMatch[] {
  const sid = normalizeSessionId(sessionId);
  return data.get(sid) ?? [];
}

export function setSessionMatches(
  sessionId: string | string[] | undefined | null,
  matches: SessionMatch[],
) {
  const sid = normalizeSessionId(sessionId);
  data.set(sid, [...matches]);
  notify();
}

export function replaceSessionMatch(
  sessionId: string | string[] | undefined | null,
  match: SessionMatch,
) {
  const sid = normalizeSessionId(sessionId);
  const list = data.get(sid) ?? [];
  const idx = list.findIndex((m) => m.id === match.id);
  if (idx === -1) return;
  const next = [...list];
  next[idx] = match;
  data.set(sid, next);
  notify();
}

export function ensureSessionBucket(sessionId: string | string[] | undefined | null) {
  const sid = normalizeSessionId(sessionId);
  if (!data.has(sid)) {
    data.set(sid, []);
  }
}

/** Hook: satu sumber kebenaran untuk daftar match per sesi */
export function useSessionMatches(sessionId: string | string[] | undefined | null) {
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const sid = useMemo(() => normalizeSessionId(sessionId), [sessionId]);

  useEffect(() => {
    return subscribeSessionMatches(() => bump());
  }, []);

  useEffect(() => {
    bump();
  }, [sid]);

  const matches = data.get(sid) ?? [];

  const setMatches = useCallback(
    (nextInput: SetMatchesInput) => {
      const prev = data.get(sid) ?? [];
      const next =
        typeof nextInput === 'function'
          ? nextInput([...prev])
          : nextInput;
      data.set(sid, [...next]);
      notify();
    },
    [sid],
  );

  const patchMatch = useCallback(
    (matchId: string, patch: Partial<SessionMatch>) => {
      const list = data.get(sid) ?? [];
      const idx = list.findIndex((m) => m.id === matchId);
      if (idx === -1) return;
      const next = [...list];
      next[idx] = { ...next[idx], ...patch };
      data.set(sid, next);
      notify();
    },
    [sid],
  );

  return { matches, setMatches, patchMatch };
}
