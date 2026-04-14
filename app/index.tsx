import { OutlineButton, PrimaryButton } from '@/components/auth/auth-buttons';
import { authColors } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { useAuth } from '@/contexts/AuthContext';
import { fontFamily } from '@/constants/typography';
import { Redirect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
      </View>
      <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 24) }]}>
        <Text style={styles.title}>Badminton App</Text>
        <Text style={styles.subtitle}>Kelola sesi dan pemain badminton Anda.</Text>
        <PrimaryButton label="Masuk" onPress={() => router.push('/login')} style={styles.btn} />
        <OutlineButton label="Daftar" onPress={() => router.push('/register')} style={styles.btn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...commonStyles.screenRoot,
  },
  hero: {
    flex: 1,
    minHeight: 280,
    backgroundColor: authColors.accentBlueMuted,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 14,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: authColors.black,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    marginBottom: 8,
    lineHeight: 22,
  },
  btn: {
    width: '100%',
  },
});
