import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { MASTER_PLAYERS, type SessionPlayer } from '@/constants/session-players';
import { fontFamily } from '@/constants/typography';
import {
  ensureSessionBucket,
  getSessionMatches,
  type GridSlot,
  type MatchFormat,
  normalizeSessionId,
  type SessionMatch,
  useSessionMatches,
} from '@/stores/session-matches';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatPlayedAt(isoOrYmd: string): string {
  if (!isoOrYmd.trim()) return '';
  try {
    const d = new Date(isoOrYmd.includes('T') ? isoOrYmd : `${isoOrYmd}T12:00:00`);
    if (Number.isNaN(d.getTime())) return isoOrYmd;
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoOrYmd;
  }
}

type StandingRow = {
  name: string;
  permainan: number;
  menang: number;
  kalah: number;
  poin: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function parseScore(s: string): number | null {
  const t = s.trim();
  if (t === '') return null;
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

/**
 * Mirrors badminton SessionRankingService: only checked players; only matches with both
 * scores set and every participant checked; points are rally totals; W/L from home vs away.
 */
function computeStandings(
  playersById: Map<string, SessionPlayer>,
  activeIds: Set<string>,
  matches: SessionMatch[],
): StandingRow[] {
  const stats = new Map<
    string,
    { permainan: number; menang: number; kalah: number; poin: number }
  >();
  for (const id of activeIds) {
    if (playersById.has(id)) {
      stats.set(id, { permainan: 0, menang: 0, kalah: 0, poin: 0 });
    }
  }

  for (const m of matches) {
    const hs = parseScore(m.homeScore);
    const as = parseScore(m.awayScore);
    if (hs === null || as === null) continue;

    const ids: string[] =
      m.format === 'singles'
        ? [m.homePlayerOneId, m.awayPlayerOneId]
        : [
            m.homePlayerOneId,
            m.homePlayerTwoId!,
            m.awayPlayerOneId,
            m.awayPlayerTwoId!,
          ];

    let allActive = true;
    for (const pid of ids) {
      if (!activeIds.has(pid)) {
        allActive = false;
        break;
      }
    }
    if (!allActive) continue;

    if (m.format === 'singles') {
      const hId = m.homePlayerOneId;
      const aId = m.awayPlayerOneId;
      const sh = stats.get(hId);
      const sa = stats.get(aId);
      if (!sh || !sa) continue;
      sh.permainan++;
      sa.permainan++;
      sh.poin += hs;
      sa.poin += as;
      if (hs > as) {
        sh.menang++;
        sa.kalah++;
      } else if (hs < as) {
        sa.menang++;
        sh.kalah++;
      }
    } else {
      const homeIds = [m.homePlayerOneId, m.homePlayerTwoId!];
      const awayIds = [m.awayPlayerOneId, m.awayPlayerTwoId!];
      for (const id of homeIds) {
        const s = stats.get(id);
        if (s) {
          s.permainan++;
          s.poin += hs;
        }
      }
      for (const id of awayIds) {
        const s = stats.get(id);
        if (s) {
          s.permainan++;
          s.poin += as;
        }
      }
      if (hs > as) {
        for (const id of homeIds) {
          const s = stats.get(id);
          if (s) s.menang++;
        }
        for (const id of awayIds) {
          const s = stats.get(id);
          if (s) s.kalah++;
        }
      } else if (hs < as) {
        for (const id of awayIds) {
          const s = stats.get(id);
          if (s) s.menang++;
        }
        for (const id of homeIds) {
          const s = stats.get(id);
          if (s) s.kalah++;
        }
      }
    }
  }

  const rows: StandingRow[] = [];
  for (const id of activeIds) {
    const p = playersById.get(id);
    const s = stats.get(id);
    if (!p || !s) continue;
    rows.push({
      name: p.name,
      permainan: s.permainan,
      menang: s.menang,
      kalah: s.kalah,
      poin: s.poin,
    });
  }

  rows.sort((a, b) => {
    if (b.poin !== a.poin) return b.poin - a.poin;
    if (b.menang !== a.menang) return b.menang - a.menang;
    return a.name.localeCompare(b.name, 'id');
  });

  return rows;
}

function formatListScore(h: string, a: string): string {
  if (!h.trim() && !a.trim()) return '0   vs   0';
  return `${h.trim() || '0'}   vs   ${a.trim() || '0'}`;
}

function defaultGridSlots(
  format: MatchFormat,
  h1: string,
  h2: string | null,
  a1: string,
  a2: string | null,
): Record<GridSlot, string | null> {
  if (format === 'singles') {
    return { tl: h1, tr: null, bl: null, br: a1 };
  }
  return { tl: h1, tr: h2, bl: a1, br: a2 };
}

function parseFieldCount(s: string): number {
  const n = parseInt(s, 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(64, n);
}

function createDummyMatches(sessionId: string): SessionMatch[] {
  const [p1, p2, p3, p4, p5] = MASTER_PLAYERS.map((p) => p.id);
  return [
    {
      id: `${sessionId}-dummy-1`,
      format: 'doubles',
      courtNumber: 1,
      homePlayerOneId: p1,
      homePlayerTwoId: p2,
      awayPlayerOneId: p3,
      awayPlayerTwoId: p4,
      homeScore: '21',
      awayScore: '17',
      serveSide: 'home',
      gridSlots: defaultGridSlots('doubles', p1, p2, p3, p4),
    },
    {
      id: `${sessionId}-dummy-2`,
      format: 'singles',
      courtNumber: 2,
      homePlayerOneId: p5,
      homePlayerTwoId: null,
      awayPlayerOneId: p1,
      awayPlayerTwoId: null,
      homeScore: '18',
      awayScore: '21',
      serveSide: 'away',
      gridSlots: defaultGridSlots('singles', p5, null, p1, null),
    },
  ];
}

type ManualPickField = 'h1' | 'h2' | 'a1' | 'a2';

export default function SesiDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    playedAt?: string;
    notes?: string;
  }>();

  const sessionId = useMemo(() => normalizeSessionId(params.id), [params.id]);
  const name = params.name ?? 'Sesi';
  const playedAt = params.playedAt ?? '';
  const notes = params.notes ?? '';
  const dateLine = formatPlayedAt(playedAt);

  const playersById = useMemo(() => {
    const m = new Map<string, SessionPlayer>();
    for (const p of MASTER_PLAYERS) m.set(p.id, p);
    return m;
  }, []);

  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(MASTER_PLAYERS.map((p) => p.id)),
  );

  const [fieldCountStr, setFieldCountStr] = useState('2');
  const [randomizeFieldStr, setRandomizeFieldStr] = useState('2');
  const [randomizeCountStr, setRandomizeCountStr] = useState('1');
  const [randomizeFormat, setRandomizeFormat] = useState<MatchFormat>('doubles');

  const [manualFormat, setManualFormat] = useState<MatchFormat>('doubles');
  const [manualH1, setManualH1] = useState('');
  const [manualH2, setManualH2] = useState('');
  const [manualA1, setManualA1] = useState('');
  const [manualA2, setManualA2] = useState('');
  const [manualPicker, setManualPicker] = useState<ManualPickField | null>(null);

  const { matches, setMatches } = useSessionMatches(sessionId);

  const checkedPool = useMemo(
    () => MASTER_PLAYERS.filter((p) => checkedIds.has(p.id)),
    [checkedIds],
  );

  useEffect(() => {
    ensureSessionBucket(sessionId);
  }, [sessionId]);

  useEffect(() => {
    if (matches.length > 0) return;
    setMatches(createDummyMatches(sessionId));
  }, [matches.length, sessionId, setMatches]);

  useEffect(() => {
    if (manualFormat === 'singles') {
      setManualH2('');
      setManualA2('');
    }
  }, [manualFormat]);

  const standings = useMemo(
    () => computeStandings(playersById, checkedIds, matches),
    [playersById, checkedIds, matches],
  );

  const togglePlayer = useCallback((id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onSaveCourts = useCallback(() => {
    const n = parseInt(fieldCountStr, 10);
    if (!Number.isFinite(n) || n < 1 || n > 64) {
      Alert.alert('Lapangan', 'Masukkan 1–64 lapangan.');
      return;
    }
    setRandomizeFieldStr(String(n));
    Alert.alert('Tersimpan', `Jumlah lapangan: ${n}.`);
  }, [fieldCountStr]);

  const onRandomize = useCallback(() => {
    const fc = parseInt(randomizeFieldStr, 10);
    if (!Number.isFinite(fc) || fc < 1 || fc > 64) {
      Alert.alert('Lapangan', 'Masukkan 1–64 lapangan pada randomizer.');
      return;
    }
    setFieldCountStr(String(fc));

    const count = parseInt(randomizeCountStr, 10);
    if (!Number.isFinite(count) || count < 1 || count > 100) {
      Alert.alert('Randomizer', 'Jumlah match wajib 1–100.');
      return;
    }

    const pool = MASTER_PLAYERS.filter((p) => checkedIds.has(p.id)).map((p) => p.id);
    const need = randomizeFormat === 'singles' ? 2 : 4;
    if (pool.length < need) {
      Alert.alert(
        'Squad',
        randomizeFormat === 'singles'
          ? 'Centang minimal 2 pemain untuk tunggal.'
          : 'Centang minimal 4 pemain untuk ganda.',
      );
      return;
    }

    const next: SessionMatch[] = [];
    const window = Math.max(2, 2 * fc);
    const recent: string[][] = [];
    const prevLen = getSessionMatches(sessionId).length;

    const needPlayers = randomizeFormat === 'singles' ? 2 : 4;
    for (let i = 0; i < count; i++) {
      const flatRecent = recent.flat();
      let best =
        randomizeFormat === 'singles'
          ? shuffle(pool).slice(0, 2)
          : shuffle(pool).slice(0, needPlayers);
      let bestOverlap = Infinity;
      for (let t = 0; t < 40; t++) {
        const cand =
          randomizeFormat === 'singles'
            ? shuffle(pool).slice(0, 2)
            : shuffle(pool).slice(0, 4);
        let overlap = 0;
        for (const id of cand) {
          if (flatRecent.includes(id)) overlap++;
        }
        if (overlap < bestOverlap) {
          bestOverlap = overlap;
          best = cand;
          if (overlap === 0) break;
        }
      }
      const picked = best;

      const id = `m-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
      const courtNumber = ((prevLen + i) % fc) + 1;
      if (randomizeFormat === 'singles') {
        next.push({
          id,
          format: 'singles',
          courtNumber,
          homePlayerOneId: picked[0],
          homePlayerTwoId: null,
          awayPlayerOneId: picked[1],
          awayPlayerTwoId: null,
          homeScore: '',
          awayScore: '',
          serveSide: 'home',
          gridSlots: defaultGridSlots('singles', picked[0], null, picked[1], null),
        });
        recent.push([picked[0], picked[1]]);
      } else {
        next.push({
          id,
          format: 'doubles',
          courtNumber,
          homePlayerOneId: picked[0],
          homePlayerTwoId: picked[1],
          awayPlayerOneId: picked[2],
          awayPlayerTwoId: picked[3],
          homeScore: '',
          awayScore: '',
          serveSide: 'home',
          gridSlots: defaultGridSlots('doubles', picked[0], picked[1], picked[2], picked[3]),
        });
        recent.push([...picked]);
      }
      if (recent.length > window) recent.shift();
    }

    setMatches((prev) => [...prev, ...next]);
    Alert.alert('Randomizer', `${count} baris match ditambahkan.`);
  }, [checkedIds, randomizeCountStr, randomizeFieldStr, randomizeFormat, sessionId, setMatches]);

  const assignManualPick = useCallback((playerId: string) => {
    if (!manualPicker) return;
    if (manualPicker === 'h1') setManualH1(playerId);
    if (manualPicker === 'h2') setManualH2(playerId);
    if (manualPicker === 'a1') setManualA1(playerId);
    if (manualPicker === 'a2') setManualA2(playerId);
    setManualPicker(null);
  }, [manualPicker]);

  const onAddManualRow = useCallback(() => {
    if (checkedPool.length === 0) {
      Alert.alert('Squad', 'Centang minimal satu pemain untuk memilih nama.');
      return;
    }
    const fc = parseFieldCount(fieldCountStr);
    const prevLen = getSessionMatches(sessionId).length;
    const courtNumber = (prevLen % fc) + 1;
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    if (manualFormat === 'singles') {
      if (!manualH1 || !manualA1) {
        Alert.alert('Tunggal', 'Pilih pemain rumah dan pemain tamu.');
        return;
      }
      if (manualH1 === manualA1) {
        Alert.alert('Tunggal', 'Pemain rumah dan tamu harus berbeda.');
        return;
      }
      const row: SessionMatch = {
        id,
        format: 'singles',
        courtNumber,
        homePlayerOneId: manualH1,
        homePlayerTwoId: null,
        awayPlayerOneId: manualA1,
        awayPlayerTwoId: null,
        homeScore: '',
        awayScore: '',
        serveSide: 'home',
        gridSlots: defaultGridSlots('singles', manualH1, null, manualA1, null),
      };
      setMatches((prev) => [...prev, row]);
      setManualH1('');
      setManualA1('');
      Alert.alert('Match', 'Baris tunggal ditambahkan.');
      return;
    }

    if (!manualH1 || !manualH2 || !manualA1 || !manualA2) {
      Alert.alert('Ganda', 'Pilih keempat pemain (rumah 1–2, tamu 1–2).');
      return;
    }
    const four = new Set([manualH1, manualH2, manualA1, manualA2]);
    if (four.size !== 4) {
      Alert.alert('Ganda', 'Keempat pemain harus berbeda.');
      return;
    }
    const row: SessionMatch = {
      id,
      format: 'doubles',
      courtNumber,
      homePlayerOneId: manualH1,
      homePlayerTwoId: manualH2,
      awayPlayerOneId: manualA1,
      awayPlayerTwoId: manualA2,
      homeScore: '',
      awayScore: '',
      serveSide: 'home',
      gridSlots: defaultGridSlots('doubles', manualH1, manualH2, manualA1, manualA2),
    };
    setMatches((prev) => [...prev, row]);
    setManualH1('');
    setManualH2('');
    setManualA1('');
    setManualA2('');
    Alert.alert('Match', 'Baris ganda ditambahkan.');
  }, [
    checkedPool.length,
    fieldCountStr,
    manualA1,
    manualA2,
    manualFormat,
    manualH1,
    manualH2,
    sessionId,
    setMatches,
  ]);

  const openMatchDetail = useCallback(
    (matchId: string) => {
      router.push({
        pathname: '/sesi-match-detail',
        params: { sessionId, matchId },
      });
    },
    [router, sessionId],
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={authColors.black} />
          </Pressable>
          <Text style={styles.backHint}>← Semua sesi</Text>
        </View>

        <Text style={styles.h1}>{name}</Text>
        <Text style={styles.dateLine}>
          {dateLine ? dateLine : 'Tanggal belum diatur'}
        </Text>
        {notes ? <Text style={styles.notes}>{notes}</Text> : null}

        <Pressable style={styles.paymentLink}>
          <Text style={styles.paymentLinkText}>Pembayaran & patungan →</Text>
        </Pressable>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.cardTitle}>Squad sesi</Text>
          <Text style={styles.cardDesc}>
            Centang pemain yang ikut. Hanya yang dicentang dipakai randomizer dan peringkat. Baris
            match dihitung jika skor keduanya terisi dan semua pemain di baris itu ikut squad.
          </Text>
          {MASTER_PLAYERS.map((p) => {
            const on = checkedIds.has(p.id);
            return (
              <Pressable
                key={p.id}
                onPress={() => togglePlayer(p.id)}
                style={styles.squadRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}>
                <Ionicons
                  name={on ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={on ? authColors.primary : authColors.border}
                />
                <Text style={styles.squadName}>{p.name}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.cardTitle}>Lapangan aktif</Text>
          <Text style={styles.cardDesc}>
            Berapa lapangan jalan bersamaan (1–64). Randomizer memakai ini agar tidak memutar
            kombinasi pemain yang sama dalam beberapa match terakhir (setara max(2, 2 × lapangan)).
          </Text>
          <View style={styles.inlineForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jumlah lapangan</Text>
              <TextInput
                value={fieldCountStr}
                onChangeText={setFieldCountStr}
                keyboardType="number-pad"
                maxLength={2}
                placeholder="2"
                placeholderTextColor={authColors.placeholder}
                style={styles.inputSm}
              />
            </View>
            <Pressable onPress={onSaveCourts} style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Simpan lapangan</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.cardTitle}>Randomizer</Text>
          <Text style={styles.cardDesc}>
            Menambah baris match baru untuk squad yang dicentang. Isi jumlah match (wajib). Lapangan
            di bawah juga memperbarui sesi seperti di bagian Lapangan aktif.
          </Text>
          <View style={styles.randomGrid}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lapangan (update sesi)</Text>
              <TextInput
                value={randomizeFieldStr}
                onChangeText={setRandomizeFieldStr}
                keyboardType="number-pad"
                maxLength={2}
                style={styles.inputSm}
                placeholderTextColor={authColors.placeholder}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jumlah match *</Text>
              <TextInput
                value={randomizeCountStr}
                onChangeText={setRandomizeCountStr}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="1"
                placeholderTextColor={authColors.placeholder}
                style={styles.inputSm}
              />
            </View>
            <View style={styles.inputGroupGrow}>
              <Text style={styles.inputLabel}>Format</Text>
              <View style={styles.formatRow}>
                <Pressable
                  onPress={() => setRandomizeFormat('singles')}
                  style={[
                    styles.formatChip,
                    randomizeFormat === 'singles' && styles.formatChipOn,
                  ]}>
                  <Text
                    style={[
                      styles.formatChipText,
                      randomizeFormat === 'singles' && styles.formatChipTextOn,
                    ]}>
                    Tunggal
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setRandomizeFormat('doubles')}
                  style={[
                    styles.formatChip,
                    randomizeFormat === 'doubles' && styles.formatChipOn,
                  ]}>
                  <Text
                    style={[
                      styles.formatChipText,
                      randomizeFormat === 'doubles' && styles.formatChipTextOn,
                    ]}>
                    Ganda
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          <Pressable onPress={onRandomize} style={styles.btnRandomize}>
            <Text style={styles.btnRandomizeText}>Generate</Text>
          </Pressable>
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.cardTitle}>Tambah baris manual</Text>
          <Text style={styles.cardDesc}>
            Pilih pemain dari squad yang dicentang. Lapangan diisi otomatis (putaran dari jumlah
            lapangan di atas).
          </Text>
          <View style={styles.formatRow}>
            <Pressable
              onPress={() => setManualFormat('singles')}
              style={[styles.formatChip, manualFormat === 'singles' && styles.formatChipOn]}>
              <Text
                style={[
                  styles.formatChipText,
                  manualFormat === 'singles' && styles.formatChipTextOn,
                ]}>
                Tunggal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setManualFormat('doubles')}
              style={[styles.formatChip, manualFormat === 'doubles' && styles.formatChipOn]}>
              <Text
                style={[
                  styles.formatChipText,
                  manualFormat === 'doubles' && styles.formatChipTextOn,
                ]}>
                Ganda
              </Text>
            </Pressable>
          </View>

          <Text style={styles.manualSectionLabel}>Rumah</Text>
          <Pressable
            onPress={() => checkedPool.length && setManualPicker('h1')}
            style={[styles.dropdownBtn, checkedPool.length === 0 && styles.dropdownDisabled]}>
            <Text style={styles.dropdownBtnText} numberOfLines={1}>
              {manualH1
                ? playersById.get(manualH1)?.name ?? '—'
                : 'Pilih pemain 1 (rumah)'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={authColors.secondary} />
          </Pressable>
          {manualFormat === 'doubles' ? (
            <>
              <Pressable
                onPress={() => checkedPool.length && setManualPicker('h2')}
                style={[
                  styles.dropdownBtn,
                  checkedPool.length === 0 && styles.dropdownDisabled,
                ]}>
                <Text style={styles.dropdownBtnText} numberOfLines={1}>
                  {manualH2
                    ? playersById.get(manualH2)?.name ?? '—'
                    : 'Pilih pemain 2 (rumah)'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={authColors.secondary} />
              </Pressable>
            </>
          ) : null}

          <Text style={[styles.manualSectionLabel, { marginTop: 12 }]}>Tamu</Text>
          <Pressable
            onPress={() => checkedPool.length && setManualPicker('a1')}
            style={[styles.dropdownBtn, checkedPool.length === 0 && styles.dropdownDisabled]}>
            <Text style={styles.dropdownBtnText} numberOfLines={1}>
              {manualA1
                ? playersById.get(manualA1)?.name ?? '—'
                : manualFormat === 'singles'
                  ? 'Pilih pemain tamu'
                  : 'Pilih pemain 1 (tamu)'}
            </Text>
            <Ionicons name="chevron-down" size={18} color={authColors.secondary} />
          </Pressable>
          {manualFormat === 'doubles' ? (
            <Pressable
              onPress={() => checkedPool.length && setManualPicker('a2')}
              style={[styles.dropdownBtn, checkedPool.length === 0 && styles.dropdownDisabled]}>
              <Text style={styles.dropdownBtnText} numberOfLines={1}>
                {manualA2
                  ? playersById.get(manualA2)?.name ?? '—'
                  : 'Pilih pemain 2 (tamu)'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={authColors.secondary} />
            </Pressable>
          ) : null}

          {checkedPool.length === 0 ? (
            <Text style={styles.manualWarn}>Centang pemain di squad agar muncul di dropdown.</Text>
          ) : null}

          <Pressable onPress={onAddManualRow} style={styles.btnManualAdd}>
            <Text style={styles.btnManualAddText}>Tambah baris</Text>
          </Pressable>
        </View>

        <Modal
          visible={manualPicker !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setManualPicker(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setManualPicker(null)}>
            <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
              <Text style={styles.modalTitle}>Pilih pemain</Text>
              <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
                {checkedPool.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.modalRow}
                    onPress={() => assignManualPick(p.id)}>
                    <Text style={styles.modalRowText}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        <Text style={styles.sectionHeading}>Peringkat sesi</Text>
        <Text style={styles.sectionHint}>
          Hanya pemain tercentang. Permainan = game yang skor rumah & tamu terisi dan semua pemain di
          baris ikut squad. Poin = total rally yang Anda cetak di game itu. Menang/kalah mengikuti
          sisi rumah vs tamu (seri tidak menambah M atau K).
        </Text>
        <View style={[styles.tableCard, shadowCard]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <View style={styles.tableHeadRow}>
                <Text style={[styles.th, styles.colRank]}>#</Text>
                <Text style={[styles.th, styles.colName]}>Nama</Text>
                <Text style={[styles.th, styles.colNum]}>Permainan</Text>
                <Text style={[styles.th, styles.colNum]}>Menang</Text>
                <Text style={[styles.th, styles.colNum]}>Kalah</Text>
                <Text style={[styles.th, styles.colNum]}>Poin</Text>
              </View>
              {standings.length === 0 ? (
                <Text style={styles.tableEmpty}>
                  Centang pemain dan lengkapi skor pada match untuk melihat peringkat.
                </Text>
              ) : (
                standings.map((row, idx) => (
                  <View key={`${idx}-${row.name}`} style={styles.tableRow}>
                    <Text style={[styles.td, styles.colRank]}>{idx + 1}</Text>
                    <Text style={[styles.td, styles.colName]}>{row.name}</Text>
                    <Text style={[styles.td, styles.colNum]}>{row.permainan}</Text>
                    <Text style={[styles.td, styles.colNum, styles.win]}>{row.menang}</Text>
                    <Text style={[styles.td, styles.colNum]}>{row.kalah}</Text>
                    <Text style={[styles.td, styles.colNum, styles.points]}>{row.poin}</Text>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>

        <Text style={styles.sectionHeading}>Match</Text>
        <Text style={styles.matchListHint}>
          Tap baris untuk mengisi skor, servis, dan posisi di layar terpisah.
        </Text>
        {matches.length === 0 ? (
          <Text style={styles.empty}>Belum ada match. Pakai randomizer atau nanti tambah manual.</Text>
        ) : (
          matches.map((m) => {
            const n = (id: string) => playersById.get(id)?.name ?? '?';
            const leftNames =
              m.format === 'singles'
                ? n(m.homePlayerOneId)
                : `${n(m.homePlayerOneId)}  ${n(m.homePlayerTwoId!)}`;
            const rightNames =
              m.format === 'singles'
                ? n(m.awayPlayerOneId)
                : `${n(m.awayPlayerOneId)}  ${n(m.awayPlayerTwoId!)}`;
            const scoreLine = formatListScore(m.homeScore, m.awayScore);
            return (
              <Pressable
                key={m.id}
                onPress={() => openMatchDetail(m.id)}
                style={({ pressed }) => [
                  styles.matchListRow,
                  shadowCard,
                  pressed && { opacity: 0.92 },
                ]}>
                <Text style={styles.matchCourtTag}>Lapangan #{m.courtNumber}</Text>
                <View style={styles.matchOneLine}>
                  <Text style={styles.matchCellSide} numberOfLines={1}>
                    {leftNames}
                  </Text>
                  <Text style={styles.matchCellScore} numberOfLines={1}>
                    {scoreLine}
                  </Text>
                  <Text
                    style={[styles.matchCellSide, styles.matchCellSideRight]}
                    numberOfLines={1}>
                    {rightNames}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...commonStyles.screenRoot,
  },
  scroll: {
    ...commonStyles.screenScroll,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.primary,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: authColors.black,
    marginBottom: 6,
  },
  dateLine: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.7,
    marginBottom: 8,
  },
  notes: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.65,
    marginTop: 8,
    lineHeight: 20,
  },
  paymentLink: {
    marginTop: 12,
    marginBottom: 20,
  },
  paymentLinkText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: authColors.primary,
  },
  card: {
    ...commonStyles.cardSurface,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    ...commonStyles.sectionTitleCaps,
    marginBottom: 8,
  },
  cardDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.55,
    lineHeight: 18,
    marginBottom: 12,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  squadName: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
  },
  inlineForm: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputGroup: {
    marginRight: 8,
  },
  inputGroupGrow: {
    flex: 1,
    minWidth: 160,
  },
  inputLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: authColors.black,
    opacity: 0.5,
    marginBottom: 6,
  },
  inputSm: {
    ...commonStyles.inputBase,
    minWidth: 88,
  },
  btnSecondary: {
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: authColors.surface,
  },
  btnSecondaryText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
  },
  randomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  formatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.background,
  },
  formatChipOn: {
    borderColor: authColors.primary,
    backgroundColor: `${authColors.primary}18`,
  },
  formatChipText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.7,
  },
  formatChipTextOn: {
    fontFamily: fontFamily.bold,
    opacity: 1,
    color: authColors.primary,
  },
  btnRandomize: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: `${authColors.primary}55`,
    backgroundColor: `${authColors.primary}14`,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  btnRandomizeText: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: authColors.primary,
  },
  sectionHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: authColors.black,
    opacity: 0.5,
    marginBottom: 6,
    marginTop: 4,
  },
  sectionHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.5,
    lineHeight: 18,
    marginBottom: 10,
  },
  tableCard: {
    ...commonStyles.cardSurface,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tableHeadRow: {
    flexDirection: 'row',
    backgroundColor: authColors.background,
    borderBottomWidth: 1,
    borderBottomColor: authColors.divider,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  th: {
    fontFamily: fontFamily.bold,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: authColors.black,
    opacity: 0.45,
  },
  td: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
  },
  colRank: { width: 36, textAlign: 'center' },
  colName: { width: 120 },
  colNum: { width: 88, textAlign: 'right', fontVariant: ['tabular-nums'] },
  win: { color: authColors.primary, fontFamily: fontFamily.bold },
  points: { fontFamily: fontFamily.bold, fontSize: 15 },
  tableEmpty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.45,
    padding: 20,
    textAlign: 'center',
  },
  empty: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.55,
    marginBottom: 16,
  },
  matchListHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.45,
    marginBottom: 10,
    lineHeight: 18,
  },
  matchListRow: {
    ...commonStyles.cardSurfaceCompact,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    marginBottom: 10,
  },
  matchCourtTag: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: authColors.black,
    opacity: 0.4,
    marginBottom: 6,
  },
  matchOneLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  matchCellSide: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
  },
  matchCellSideRight: {
    textAlign: 'right',
  },
  matchCellScore: {
    flexShrink: 0,
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.85,
    minWidth: 96,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  manualSectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: authColors.black,
    opacity: 0.45,
    marginBottom: 6,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: authColors.inputBg,
  },
  dropdownDisabled: {
    opacity: 0.45,
  },
  dropdownBtnText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    marginRight: 8,
  },
  manualWarn: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.5,
    marginTop: 4,
    marginBottom: 10,
  },
  btnManualAdd: {
    marginTop: 8,
    backgroundColor: authColors.primary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  btnManualAddText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    padding: 24,
  },
  modalSheet: {
    backgroundColor: authColors.surface,
    borderRadius: 14,
    maxHeight: '72%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  modalScroll: {
    maxHeight: 360,
  },
  modalRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  modalRowText: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: authColors.black,
  },
});
