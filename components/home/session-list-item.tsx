import { authColors } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import {
  formatSessionDate,
  type GameSessionRow,
} from '@/constants/mock-game-data';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  session: GameSessionRow;
  /** Garis pemisah bawah (untuk daftar dalam satu kartu) */
  showBottomDivider?: boolean;
};

/** Tanggal di atas, nama dominan, lalu baris pemain / permainan (angka tegas seperti nama). */
export function SessionListItem({ session, showBottomDivider = true }: Props) {
  const dateStr = formatSessionDate(session.dateIso);

  return (
    <View style={[styles.wrap, showBottomDivider && styles.wrapDivider]}>
      <Text style={styles.date} numberOfLines={1}>
        {dateStr}
      </Text>
      <Text style={styles.sessionName} numberOfLines={2}>
        {session.name}
      </Text>
      <View style={styles.metrics}>
        <View style={styles.metricCol}>
          <Text style={styles.label}>pemain</Text>
          <Text style={styles.value}>{session.playerCount}</Text>
        </View>
        <View style={styles.metricCol}>
          <Text style={styles.label}>permainan</Text>
          <Text style={styles.value}>{session.matchCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 14,
  },
  wrapDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    marginBottom: 4,
  },
  sessionName: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: authColors.black,
    lineHeight: 22,
    marginBottom: 10,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 8,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
    textTransform: 'lowercase',
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: authColors.black,
  },
});
