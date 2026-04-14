import { authColors } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LaporanPermainanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={28} color={authColors.black} />
        </Pressable>
        <Text style={styles.title}>Laporan permainan</Text>
      </View>
      <Text style={styles.placeholder}>Ringkasan laporan akan ditampilkan di sini.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...commonStyles.screenRoot, paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  back: { alignSelf: 'flex-start', marginBottom: 8 },
  title: { fontFamily: fontFamily.bold, fontSize: 22, color: authColors.black },
  placeholder: { fontFamily: fontFamily.regular, fontSize: 15, color: authColors.black, opacity: 0.7 },
});
