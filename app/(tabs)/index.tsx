import { RecentMatchRow } from '@/components/home/recent-match-row';
import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import {
  mockPlayerSummary,
  mockRecentMatches,
  winRatePercent,
} from '@/constants/mock-game-data';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { totalMatches, menang, kalah, point } = mockPlayerSummary;
  const winRate = winRatePercent(menang, kalah);
  const pointFormatted = point.toLocaleString('id-ID');
  const summaryLine = `Menang: ${menang} - Kalah: ${kalah} - Point: ${pointFormatted} - Winrate: ${winRate}%`;

  const recentMatches = [...mockRecentMatches]
    .sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    .slice(0, 5);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>Hi, Joshua Natan W</Text>

        {/* Hero: jumlah permainan */}
        <View style={[styles.heroCard, styles.cardCompact, shadowCard]}>
          <Text style={styles.heroLabel}>Jumlah permainan</Text>
          <View style={styles.heroValueRow}>
            <Text style={styles.heroValue}>{totalMatches}</Text>
            <Text style={styles.heroValueSuffix}> Permainan</Text>
          </View>
          <Text style={styles.heroHint}>{summaryLine}</Text>
        </View>

        {/* Menu */}
        <View style={styles.menuRow}>
          <Pressable
            onPress={() => router.push('/buat-sesi-baru')}
            style={({ pressed }) => [
              styles.menuCard,
              styles.cardCompact,
              shadowCard,
              pressed && { opacity: 0.92 },
            ]}>
            <View style={styles.iconCircle}>
              <Ionicons name="add-circle-outline" size={26} color={authColors.primary} />
            </View>
            <Text style={styles.menuLabel}>Buat Sesi Baru</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/laporan-permainan')}
            style={({ pressed }) => [
              styles.menuCard,
              styles.cardCompact,
              shadowCard,
              pressed && { opacity: 0.92 },
            ]}>
            <View style={styles.iconCircle}>
              <Ionicons name="bar-chart-outline" size={26} color={authColors.primary} />
            </View>
            <Text style={styles.menuLabel}>Lihat Laporan Permainan</Text>
          </Pressable>
        </View>

        {/* Permainan terakhir */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Permainan terakhir</Text>
          <Pressable
            onPress={() => router.push('/game-sessions')}
            hitSlop={8}
            style={({ pressed }) => [styles.moreLinkWrap, pressed && { opacity: 0.7 }]}>
            <Text style={styles.moreLinkText}>Lihat lebih banyak</Text>
          </Pressable>
        </View>
        <View style={[styles.listCard, shadowCard]}>
          {recentMatches.map((m, i) => (
            <RecentMatchRow key={m.id} match={m} showDivider={i < recentMatches.length - 1} />
          ))}
        </View>
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
    paddingTop: 20,
  },
  screenTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: authColors.black,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  heroCard: {
    ...commonStyles.cardSurface,
    marginBottom: 10,
  },
  cardCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
    marginBottom: 3,
  },
  heroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  heroValue: {
    fontFamily: fontFamily.bold,
    fontSize: 30,
    letterSpacing: -0.8,
    color: authColors.black,
    lineHeight: 34,
  },
  heroValueSuffix: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: authColors.black,
    lineHeight: 34,
  },
  heroHint: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: authColors.black,
    marginTop: 6,
    lineHeight: 15,
  },
  menuRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  menuCard: {
    flex: 1,
    ...commonStyles.cardSurface,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    minHeight: 112,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: authColors.accentBlueMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  menuLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: authColors.black,
    textAlign: 'center',
    lineHeight: 16,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: authColors.black,
    flex: 1,
    flexShrink: 1,
  },
  moreLinkWrap: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  moreLinkText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: authColors.black,
  },
  listCard: {
    ...commonStyles.cardSurfaceCompact,
    borderColor: authColors.inputBorder,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
});
