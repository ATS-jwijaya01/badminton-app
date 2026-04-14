import { authColors } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import { formatSessionDate, type RecentDoublesMatch } from '@/constants/mock-game-data';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  match: RecentDoublesMatch;
  showDivider?: boolean;
};

export function RecentMatchRow({ match, showDivider }: Props) {
  const dateStr = formatSessionDate(match.dateIso);
  const [opp1, opp2] = match.opponentNames;

  return (
    <View style={[styles.wrap, showDivider && styles.wrapDivider]}>
      <View style={styles.topRow}>
        <Text style={styles.date}>{dateStr}</Text>
        <View style={[styles.badge, match.won ? styles.badgeWin : styles.badgeLose]}>
          <Text style={styles.badgeText}>{match.won ? 'Menang' : 'Kalah'}</Text>
        </View>
      </View>

      {/* Satu baris: Anda · Rekan  vs  Lawan1 · Lawan2 — tiap sisi rata tengah */}
      <View style={styles.namesRow}>
        <View style={styles.sideCol}>
          <View style={styles.nameGroup}>
            <Text style={styles.you}>Anda</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.name}>{match.partnerName}</Text>
          </View>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.sideCol}>
          <View style={styles.nameGroup}>
            <Text style={styles.name}>{opp1}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.name}>{opp2}</Text>
          </View>
        </View>
      </View>

      {/* Skor: angka di tengah masing-masing sisi, strip di tengah */}
      <View style={styles.scoreRow}>
        <View style={styles.sideCol}>
          <Text style={styles.scoreNum}>{match.scoreUs}</Text>
        </View>
        <Text style={styles.scoreSep}>-</Text>
        <View style={styles.sideCol}>
          <Text style={styles.scoreNum}>{match.scoreThem}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
  },
  wrapDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  date: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeWin: {
    backgroundColor: authColors.primary,
  },
  badgeLose: {
    backgroundColor: authColors.black,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: authColors.white,
  },
  namesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  sideCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  you: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: authColors.black,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: authColors.black,
  },
  dot: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
    opacity: 0.45,
  },
  vs: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: authColors.secondary,
    paddingHorizontal: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNum: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: authColors.black,
    fontVariant: ['tabular-nums'],
  },
  scoreSep: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.black,
    opacity: 0.35,
    paddingHorizontal: 10,
  },
});
