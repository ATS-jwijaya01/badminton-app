import { PrimaryButton } from '@/components/auth/auth-buttons';
import { AuthInput } from '@/components/auth/auth-input';
import { GoogleSocialButton } from '@/components/auth/google-social-button';
import { authColors } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { useAuth } from '@/contexts/AuthContext';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

WebBrowser.maybeCompleteAuthSession();

function getGoogleNativeScheme(clientId?: string): string | undefined {
  if (!clientId) {
    return undefined;
  }
  const suffix = '.apps.googleusercontent.com';
  if (!clientId.endsWith(suffix)) {
    return undefined;
  }
  const prefix = clientId.slice(0, -suffix.length);
  return `com.googleusercontent.apps.${prefix}`;
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { loginWithGoogleIdToken } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
  const googleRedirectScheme =
    process.env.EXPO_PUBLIC_GOOGLE_REDIRECT_SCHEME || getGoogleNativeScheme(androidClientId);
  const redirectUri = makeRedirectUri({
    native: googleRedirectScheme ? `${googleRedirectScheme}:/oauthredirect` : undefined,
    scheme: googleRedirectScheme,
  });
  const [googleRequest, googleResponse, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    androidClientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    redirectUri,
    selectAccount: true,
  });

  const onEmailLogin = () => {
    if (!email.trim() || !password) {
      Alert.alert('Periksa lagi', 'Isi email dan kata sandi.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 400);
  };

  useEffect(() => {
    if (!googleResponse) {
      return;
    }

    if (googleResponse.type !== 'success') {
      setGoogleLoading(false);
      if (googleResponse.type !== 'dismiss' && googleResponse.type !== 'cancel') {
        Alert.alert('Google login gagal', 'Tidak bisa autentikasi ke Google.');
      }
      return;
    }

    const idToken =
      googleResponse.authentication?.idToken ??
      (typeof (googleResponse as { params?: { id_token?: string } }).params?.id_token === 'string'
        ? (googleResponse as { params?: { id_token?: string } }).params?.id_token
        : null);

    if (!idToken) {
      setGoogleLoading(false);
      Alert.alert('Google login gagal', 'ID token dari Google tidak ditemukan.');
      return;
    }

    (async () => {
      try {
        await loginWithGoogleIdToken(idToken);
        router.replace('/(tabs)');
      } catch (error) {
        Alert.alert('Google login gagal', error instanceof Error ? error.message : 'Terjadi kesalahan.');
      } finally {
        setGoogleLoading(false);
      }
    })();
  }, [googleResponse, loginWithGoogleIdToken, router]);

  const onGoogle = async () => {
    if (!googleRequest) {
      Alert.alert('Google belum siap', 'Konfigurasi Google client id belum tersedia.');
      return;
    }

    try {
      setGoogleLoading(true);
      const result = await promptAsync();
      if (result.type !== 'success') {
        setGoogleLoading(false);
      }
    } catch {
      setGoogleLoading(false);
      Alert.alert('Google login gagal', 'Tidak bisa membuka Google sign-in.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <StatusBar style="dark" />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: Math.max(insets.bottom, 24) },
          ]}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>Selamat datang kembali!</Text>
          <Text style={styles.lead}>Senang melihat Anda lagi.</Text>

          <AuthInput
            placeholder="Email"
            placeholderTextColor="rgba(0,0,0,0.45)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.field}
            style={styles.inputText}
          />

          <View style={styles.passwordRow}>
            <AuthInput
              placeholder="Kata sandi"
              placeholderTextColor="rgba(0,0,0,0.45)"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={[styles.passwordInput, styles.inputText]}
              containerStyle={styles.passwordWrap}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eye}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={authColors.black}
              />
            </Pressable>
          </View>

          <Pressable style={styles.forgotWrap}>
            <Text style={styles.forgot}>Lupa kata sandi?</Text>
          </Pressable>

          <PrimaryButton label="Masuk" onPress={onEmailLogin} loading={loading} style={styles.cta} />
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Kembali</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Atau masuk dengan</Text>
            <View style={styles.dividerLine} />
          </View>

          <GoogleSocialButton label={googleLoading ? 'Memproses Google...' : 'Google'} onPress={onGoogle} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <Pressable onPress={() => router.push('/register')}>
              <Text style={styles.footerLink}>Daftar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: {
    ...commonStyles.screenRoot,
  },
  scroll: {
    ...commonStyles.screenScrollWide,
    paddingTop: 48,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: authColors.black,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    marginTop: 8,
    marginBottom: 28,
  },
  field: {
    marginBottom: 16,
  },
  inputText: {
    fontFamily: fontFamily.regular,
    color: authColors.black,
  },
  passwordRow: {
    position: 'relative',
    marginBottom: 8,
  },
  passwordWrap: {
    marginBottom: 0,
  },
  passwordInput: {
    paddingRight: 48,
  },
  eye: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    paddingVertical: 4,
  },
  forgot: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
  },
  cta: {
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    ...commonStyles.secondaryButton,
    width: '100%',
    marginBottom: 28,
  },
  backButtonText: {
    ...commonStyles.secondaryButtonText,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    ...commonStyles.dividerLine,
  },
  dividerText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.black,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    flexWrap: 'wrap',
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
  },
  footerLink: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.black,
  },
});
