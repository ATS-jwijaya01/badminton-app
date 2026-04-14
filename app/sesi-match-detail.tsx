import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { MASTER_PLAYERS, type SessionPlayer } from '@/constants/session-players';
import { fontFamily } from '@/constants/typography';
import {
  type GridSlot,
  type SessionMatch,
  normalizeSessionId,
  replaceSessionMatch,
  useSessionMatches,
} from '@/stores/session-matches';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function nameOf(id: string | null, byId: Map<string, SessionPlayer>) {
  if (!id) return '—';
  return byId.get(id)?.name ?? '?';
}

function slotLabel(slot: GridSlot): string {
  switch (slot) {
    case 'tl':
      return 'Kiri depan';
    case 'tr':
      return 'Kanan depan';
    case 'bl':
      return 'Kiri belakang';
    case 'br':
      return 'Kanan belakang';
    default:
      return slot;
  }
}

function participantChoices(m: SessionMatch, byId: Map<string, SessionPlayer>) {
  const opts: { id: string | null; label: string }[] = [{ id: null, label: 'Kosong' }];
  if (m.format === 'singles') {
    opts.push(
      { id: m.homePlayerOneId, label: byId.get(m.homePlayerOneId)?.name ?? '?' },
      { id: m.awayPlayerOneId, label: byId.get(m.awayPlayerOneId)?.name ?? '?' },
    );
  } else {
    const ids = [
      m.homePlayerOneId,
      m.homePlayerTwoId!,
      m.awayPlayerOneId,
      m.awayPlayerTwoId!,
    ];
    for (const id of ids) {
      opts.push({ id, label: byId.get(id)?.name ?? '?' });
    }
  }
  return opts;
}

export default function SesiMatchDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ sessionId?: string | string[]; matchId?: string }>();
  const sessionId = normalizeSessionId(params.sessionId);
  const matchId = typeof params.matchId === 'string' ? params.matchId : params.matchId?.[0] ?? '';

  const { matches } = useSessionMatches(sessionId);
  const match = matches.find((x) => x.id === matchId);

  const playersById = useMemo(() => {
    const m = new Map<string, SessionPlayer>();
    for (const p of MASTER_PLAYERS) m.set(p.id, p);
    return m;
  }, []);

  const [pickerSlot, setPickerSlot] = useState<GridSlot | null>(null);

  useEffect(() => {
    if (sessionId && matchId && !match) {
      router.back();
    }
  }, [sessionId, matchId, match, router]);

  const updateMatch = useCallback(
    (patch: Partial<SessionMatch>) => {
      if (!match) return;
      replaceSessionMatch(sessionId, { ...match, ...patch });
    },
    [match, sessionId],
  );

  const incPoint = useCallback(
    (side: 'home' | 'away') => {
      if (!match) return;
      const key = side === 'home' ? 'homeScore' : 'awayScore';
      const cur = parseInt(match[key], 10);
      const next = (Number.isFinite(cur) ? cur : 0) + 1;
      updateMatch({ [key]: String(next) });
    },
    [match, updateMatch],
  );

  const onScoreChange = useCallback(
    (field: 'homeScore' | 'awayScore', text: string) => {
      const cleaned = text.replace(/[^\d]/g, '');
      updateMatch({ [field]: cleaned });
    },
    [updateMatch],
  );

  const pickerOptions = useMemo(
    () => (match ? participantChoices(match, playersById) : []),
    [match, playersById],
  );

  if (!match) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <Text style={styles.muted}>Memuat…</Text>
      </View>
    );
  }

  const homePair =
    match.format === 'singles'
      ? nameOf(match.homePlayerOneId, playersById)
      : `${nameOf(match.homePlayerOneId, playersById)} / ${nameOf(match.homePlayerTwoId, playersById)}`;
  const awayPair =
    match.format === 'singles'
      ? nameOf(match.awayPlayerOneId, playersById)
      : `${nameOf(match.awayPlayerOneId, playersById)} / ${nameOf(match.awayPlayerTwoId, playersById)}`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 28) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={authColors.black} />
          </Pressable>
          <Text style={styles.backHint}>Detail match</Text>
        </View>

        <Text style={styles.courtTag}>Lapangan #{match.courtNumber}</Text>
        <Text style={styles.h1}>
          {match.format === 'singles' ? 'Tunggal' : 'Ganda'}
        </Text>

        <View style={[styles.namesCard, shadowCard]}>
          <Text style={styles.sideLabel}>Rumah</Text>
          <Text style={styles.namesBig}>{homePair}</Text>
          <View style={styles.vsRule} />
          <Text style={styles.sideLabel}>Tamu</Text>
          <Text style={styles.namesBig}>{awayPair}</Text>
        </View>

        <Text style={styles.sectionLabel}>Skor</Text>
        <View style={styles.scoreRow}>
          <View style={styles.scoreInputWrap}>
            <Text style={styles.scoreHint}>Rumah</Text>
            <TextInput
              value={match.homeScore}
              onChangeText={(t) => onScoreChange('homeScore', t)}
              keyboardType="number-pad"
              maxLength={3}
              style={styles.scoreInput}
              placeholder="0"
              placeholderTextColor={authColors.placeholder}
            />
          </View>
          <Text style={styles.scoreDash}>vs</Text>
          <View style={styles.scoreInputWrap}>
            <Text style={styles.scoreHint}>Tamu</Text>
            <TextInput
              value={match.awayScore}
              onChangeText={(t) => onScoreChange('awayScore', t)}
              keyboardType="number-pad"
              maxLength={3}
              style={styles.scoreInput}
              placeholder="0"
              placeholderTextColor={authColors.placeholder}
            />
          </View>
        </View>

        <View style={[styles.serveCard, shadowCard]}>
          <Text style={styles.blockTitle}>Servis</Text>
          <Text style={styles.serveExplain}>
            Bola saat ini di sisi{' '}
            <Text style={styles.serveStrong}>
              {match.serveSide === 'home' ? 'rumah' : 'tamu'}
            </Text>
            .
          </Text>
          <View style={styles.courtVisual}>
            <View style={[styles.half, match.serveSide === 'home' && styles.halfActive]}>
              <Text style={styles.halfText}>Rumah</Text>
              {match.serveSide === 'home' ? (
                <Ionicons name="ellipse" size={22} color={authColors.primary} />
              ) : null}
            </View>
            <View style={[styles.half, match.serveSide === 'away' && styles.halfActive]}>
              <Text style={styles.halfText}>Tamu</Text>
              {match.serveSide === 'away' ? (
                <Ionicons name="ellipse" size={22} color={authColors.primary} />
              ) : null}
            </View>
          </View>
          <View style={styles.serveToggleRow}>
            <Pressable
              onPress={() => updateMatch({ serveSide: 'home' })}
              style={[
                styles.serveChip,
                match.serveSide === 'home' && styles.serveChipOn,
              ]}>
              <Text
                style={[
                  styles.serveChipText,
                  match.serveSide === 'home' && styles.serveChipTextOn,
                ]}>
                Servis rumah
              </Text>
            </Pressable>
            <Pressable
              onPress={() => updateMatch({ serveSide: 'away' })}
              style={[
                styles.serveChip,
                match.serveSide === 'away' && styles.serveChipOn,
              ]}>
              <Text
                style={[
                  styles.serveChipText,
                  match.serveSide === 'away' && styles.serveChipTextOn,
                ]}>
                Servis tamu
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Posisi di lapangan (2×2)</Text>
        <Text style={styles.sectionHint}>
          Tap sel untuk memilih pemain di posisi tersebut (ganda: empat pemain; tunggal: biasanya
          depan/belakang).
        </Text>
        <View style={styles.gridWrap}>
          <View style={styles.gridRow}>
            {(['tl', 'tr'] as const).map((slot) => (
              <Pressable
                key={slot}
                onPress={() => setPickerSlot(slot)}
                style={[styles.gridCell, shadowCard]}>
                <Text style={styles.gridPosLabel}>{slotLabel(slot)}</Text>
                <Text style={styles.gridName} numberOfLines={2}>
                  {nameOf(match.gridSlots[slot], playersById)}
                </Text>
                <Text style={styles.gridTap}>Ubah</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.gridRow}>
            {(['bl', 'br'] as const).map((slot) => (
              <Pressable
                key={slot}
                onPress={() => setPickerSlot(slot)}
                style={[styles.gridCell, shadowCard]}>
                <Text style={styles.gridPosLabel}>{slotLabel(slot)}</Text>
                <Text style={styles.gridName} numberOfLines={2}>
                  {nameOf(match.gridSlots[slot], playersById)}
                </Text>
                <Text style={styles.gridTap}>Ubah</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>Poin</Text>
        <View style={styles.poinRow}>
          <Pressable onPress={() => incPoint('home')} style={styles.poinBtn}>
            <Text style={styles.poinBtnText}>Poin → Rumah</Text>
          </Pressable>
          <Pressable onPress={() => incPoint('away')} style={styles.poinBtn}>
            <Text style={styles.poinBtnText}>Poin → Tamu</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={pickerSlot !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerSlot(null)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerSlot(null)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {pickerSlot ? slotLabel(pickerSlot) : ''}
            </Text>
            {pickerOptions.map((o) => (
              <Pressable
                key={String(o.id)}
                style={styles.modalRow}
                onPress={() => {
                  if (!pickerSlot) return;
                  updateMatch({
                    gridSlots: { ...match.gridSlots, [pickerSlot]: o.id },
                  });
                  setPickerSlot(null);
                }}>
                <Text style={styles.modalRowText}>{o.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...commonStyles.screenRoot },
  scroll: { ...commonStyles.screenScroll },
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
  courtTag: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
    opacity: 0.45,
    marginBottom: 4,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: authColors.black,
    marginBottom: 14,
  },
  namesCard: {
    ...commonStyles.cardSurface,
    padding: 16,
    marginBottom: 18,
  },
  sideLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.45,
    marginBottom: 4,
  },
  namesBig: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: authColors.black,
    lineHeight: 24,
  },
  vsRule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: authColors.divider,
    marginVertical: 14,
  },
  sectionLabel: {
    ...commonStyles.sectionTitleCaps,
    marginBottom: 8,
  },
  sectionHint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    opacity: 0.45,
    lineHeight: 18,
    marginBottom: 10,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  scoreInputWrap: { flex: 1 },
  scoreHint: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    opacity: 0.5,
    marginBottom: 4,
  },
  scoreInput: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    textAlign: 'center',
    borderWidth: commonStyles.inputBase.borderWidth,
    borderColor: commonStyles.inputBase.borderColor,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: commonStyles.inputBase.backgroundColor,
    color: authColors.black,
  },
  scoreDash: {
    fontSize: 14,
    opacity: 0.45,
    marginBottom: 14,
  },
  serveCard: {
    ...commonStyles.cardSurface,
    padding: 16,
    marginBottom: 20,
  },
  blockTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.45,
    marginBottom: 8,
  },
  serveExplain: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.7,
    marginBottom: 12,
  },
  serveStrong: { fontFamily: fontFamily.bold, color: authColors.primary },
  courtVisual: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: authColors.border,
    marginBottom: 12,
  },
  half: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    backgroundColor: authColors.background,
  },
  halfActive: {
    backgroundColor: `${authColors.primary}12`,
  },
  halfText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: authColors.black,
  },
  serveToggleRow: { flexDirection: 'row', gap: 8 },
  serveChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: authColors.border,
    alignItems: 'center',
  },
  serveChipOn: {
    borderColor: authColors.primary,
    backgroundColor: `${authColors.primary}14`,
  },
  serveChipText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
  },
  serveChipTextOn: {
    fontFamily: fontFamily.bold,
    color: authColors.primary,
  },
  gridWrap: { marginBottom: 16, gap: 8 },
  gridRow: { flexDirection: 'row', gap: 8 },
  gridCell: {
    flex: 1,
    ...commonStyles.cardSurfaceCompact,
    borderRadius: 12,
    padding: 10,
    minHeight: 96,
  },
  gridPosLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    opacity: 0.4,
    marginBottom: 4,
  },
  gridName: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: authColors.black,
    flex: 1,
  },
  gridTap: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: authColors.primary,
    marginTop: 4,
  },
  poinRow: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  poinBtn: {
    flex: 1,
    minWidth: 140,
    ...commonStyles.primaryButton,
  },
  poinBtnText: {
    ...commonStyles.primaryButtonText,
  },
  muted: {
    fontFamily: fontFamily.regular,
    padding: 24,
    color: authColors.black,
    opacity: 0.5,
  },
  modalBackdrop: {
    ...commonStyles.modalBackdropCentered,
  },
  modalSheet: {
    ...commonStyles.modalSheet,
    paddingVertical: 8,
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
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
