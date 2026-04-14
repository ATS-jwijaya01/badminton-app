import { SessionListItem } from '@/components/home/session-list-item';
import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { fontFamily } from '@/constants/typography';
import { mockSessions } from '@/constants/mock-game-data';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameSessionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sorted = [...mockSessions].sort(
    (a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime(),
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Kembali">
          <Ionicons name="chevron-back" size={28} color={authColors.black} />
        </Pressable>
        <Text style={styles.title}>Sesi permainan</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Math.max(insets.bottom, 24) },
        ]}
        renderItem={({ item }) => (
          <View style={[styles.rowWrap, shadowCard]}>
            <SessionListItem session={item} showBottomDivider={false} />
          </View>
        )}
        ItemSeparatorComponent={() => null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...commonStyles.screenRoot,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.divider,
  },
  back: {
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: authColors.black,
    letterSpacing: -0.3,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  rowWrap: {
    ...commonStyles.cardSurfaceCompact,
    borderColor: authColors.inputBorder,
    paddingHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
});
