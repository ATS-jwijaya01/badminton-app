import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type StrongHand = 'right' | 'left';

export default function ProfilTabScreen() {
  const insets = useSafeAreaInsets();
  const [playerName, setPlayerName] = useState('Joshua Natan');
  const [phone, setPhone] = useState('081234567890');
  const [province, setProvince] = useState('DKI Jakarta');
  const [city, setCity] = useState('Jakarta Selatan');
  const [strongHand, setStrongHand] = useState<StrongHand>('right');
  const [googleConnected, setGoogleConnected] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onSubmit = () => {
    if (!playerName.trim() || !phone.trim() || !province.trim() || !city.trim()) {
      Alert.alert('Profil', 'Nama, nomor HP, provinsi, dan kabupaten/kota wajib diisi.');
      return;
    }

    const wantsPasswordChange = !!(
      currentPassword.trim() ||
      newPassword.trim() ||
      confirmPassword.trim()
    );
    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Kata sandi', 'Lengkapi semua field kata sandi.');
        return;
      }
      if (newPassword.length < 6) {
        Alert.alert('Kata sandi', 'Kata sandi baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Kata sandi', 'Konfirmasi kata sandi tidak sama.');
        return;
      }
    }

    Alert.alert('Profil', 'Perubahan profil berhasil disimpan.');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: Math.max(insets.bottom, 24) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.subtitle}>Kelola data pemain dan preferensi akun Anda.</Text>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.sectionTitle}>Data pemain</Text>
          <Text style={styles.label}>Nama pemain</Text>
          <TextInput
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Nama lengkap"
            placeholderTextColor={authColors.placeholder}
            style={styles.input}
          />

          <View style={styles.phoneHeader}>
            <Text style={styles.label}>Nomor HP</Text>
            <View style={styles.badge}>
              <Ionicons name="checkmark-circle" size={14} color={authColors.primary} />
              <Text style={styles.badgeText}>Terverifikasi</Text>
            </View>
          </View>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="08xxxxxxxxxx"
            placeholderTextColor={authColors.placeholder}
            style={styles.input}
          />

          <Text style={styles.label}>Provinsi</Text>
          <TextInput
            value={province}
            onChangeText={setProvince}
            placeholder="Provinsi"
            placeholderTextColor={authColors.placeholder}
            style={styles.input}
          />

          <Text style={styles.label}>Kabupaten / Kota</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Kabupaten / Kota"
            placeholderTextColor={authColors.placeholder}
            style={styles.input}
          />
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.sectionTitle}>Keamanan & akun</Text>
          <Text style={styles.label}>Kata sandi saat ini</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Isi untuk ganti kata sandi"
            placeholderTextColor={authColors.placeholder}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.label}>Kata sandi baru</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Minimal 6 karakter"
            placeholderTextColor={authColors.placeholder}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.label}>Konfirmasi kata sandi baru</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ulangi kata sandi baru"
            placeholderTextColor={authColors.placeholder}
            secureTextEntry
            style={styles.input}
          />

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.linkTitle}>Google</Text>
              <Text style={styles.linkHint}>
                {googleConnected ? 'Akun Google sudah terhubung' : 'Belum terhubung'}
              </Text>
            </View>
            <Pressable
              onPress={() => setGoogleConnected((prev) => !prev)}
              style={[styles.linkBtn, googleConnected && styles.linkBtnConnected]}>
              <Text style={[styles.linkBtnText, googleConnected && styles.linkBtnTextConnected]}>
                {googleConnected ? 'Terhubung' : 'Hubungkan'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, shadowCard]}>
          <Text style={styles.sectionTitle}>Tangan Prioritas</Text>
          <View style={styles.handRow}>
            <Pressable
              onPress={() => setStrongHand('right')}
              style={[styles.handChip, strongHand === 'right' && styles.handChipOn]}>
              <Text style={[styles.handChipText, strongHand === 'right' && styles.handChipTextOn]}>
                Right
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setStrongHand('left')}
              style={[styles.handChip, strongHand === 'left' && styles.handChipOn]}>
              <Text style={[styles.handChipText, strongHand === 'left' && styles.handChipTextOn]}>
                Left
              </Text>
            </Pressable>
          </View>
        </View>

        <Pressable onPress={onSubmit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>Submit</Text>
        </Pressable>
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
    paddingTop: 12,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: authColors.black,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 16,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.65,
  },
  card: {
    marginBottom: 14,
    ...commonStyles.cardSurfaceCompact,
    padding: 14,
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: authColors.black,
    opacity: 0.55,
    marginBottom: 10,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
    opacity: 0.55,
    marginBottom: 6,
  },
  input: {
    ...commonStyles.inputBase,
    marginBottom: 10,
  },
  phoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: `${authColors.primary}33`,
    backgroundColor: `${authColors.primary}14`,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
  },
  badgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: authColors.primary,
  },
  rowBetween: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  linkTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: authColors.black,
  },
  linkHint: {
    marginTop: 2,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: authColors.black,
    opacity: 0.6,
  },
  linkBtn: {
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: authColors.surface,
  },
  linkBtnConnected: {
    borderColor: `${authColors.primary}44`,
    backgroundColor: `${authColors.primary}18`,
  },
  linkBtnText: {
    fontFamily: fontFamily.regular,
    color: authColors.black,
    fontSize: 13,
  },
  linkBtnTextConnected: {
    fontFamily: fontFamily.bold,
    color: authColors.primary,
  },
  handRow: {
    flexDirection: 'row',
    gap: 10,
  },
  handChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: authColors.background,
  },
  handChipOn: {
    borderColor: authColors.primary,
    backgroundColor: `${authColors.primary}14`,
  },
  handChipText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
  },
  handChipTextOn: {
    fontFamily: fontFamily.bold,
    color: authColors.primary,
  },
  submitBtn: {
    ...commonStyles.primaryButton,
    marginTop: 4,
  },
  submitBtnText: {
    ...commonStyles.primaryButtonText,
  },
});
