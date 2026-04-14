import { SessionDateField } from '@/components/session-date-field';
import { authColors, shadowCard } from '@/constants/auth-theme';
import { commonStyles } from '@/constants/common-styles';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function BuatSesiBaruScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  /** Tanggal opsional — null = belum dipilih (native) */
  const [playedAtDate, setPlayedAtDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [webDateStr, setWebDateStr] = useState('');

  const onSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = `sess-${Date.now()}`;
    let playedAtParam = '';
    if (Platform.OS === 'web') {
      playedAtParam = webDateStr.trim();
    } else if (playedAtDate) {
      playedAtParam = toYmd(playedAtDate);
    }
    router.replace({
      pathname: '/sesi-detail',
      params: {
        id,
        name: trimmed,
        playedAt: playedAtParam,
        notes: notes.trim(),
      },
    });
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
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Ionicons name="chevron-back" size={28} color={authColors.black} />
          </Pressable>

          <Text style={styles.pageTitle}>Sesi permainan baru</Text>
          <Text style={styles.lead}>
            Satu sesi mengelompokkan satu acara atau satu malam. Nanti Anda bisa menambah banyak match tunggal atau ganda.
          </Text>

          <View style={[styles.card, shadowCard]}>
            <Text style={styles.sectionLabel}>Sesi baru</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Nama</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="mis. Jumat malam klub"
                placeholderTextColor="rgba(0,0,0,0.4)"
                maxLength={255}
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <SessionDateField
                date={playedAtDate}
                onDateChange={setPlayedAtDate}
                webDateStr={webDateStr}
                onWebDateStrChange={setWebDateStr}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Catatan (opsional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Lapangan yang dipesan, format, dll."
                placeholderTextColor="rgba(0,0,0,0.4)"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={[styles.input, styles.textarea]}
              />
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={!name.trim()}
              style={({ pressed }) => [
                styles.submitBtn,
                !name.trim() && styles.submitDisabled,
                pressed && name.trim() && { opacity: 0.9 },
              ]}>
              <Text style={styles.submitLabel}>Buat sesi</Text>
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
    ...commonStyles.screenScroll,
  },
  back: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  pageTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: authColors.black,
    marginBottom: 8,
  },
  lead: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    opacity: 0.75,
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    ...commonStyles.cardSurface,
    padding: 16,
  },
  sectionLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: authColors.black,
    opacity: 0.5,
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    ...commonStyles.formLabel,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  input: {
    ...commonStyles.inputBase,
  },
  textarea: {
    minHeight: 72,
    paddingTop: 10,
  },
  submitBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: authColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  submitDisabled: {
    opacity: 0.45,
  },
  submitLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.white,
  },
});
