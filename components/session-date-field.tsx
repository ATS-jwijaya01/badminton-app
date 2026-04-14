import { authColors } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

type Props = {
  /** Tanggal terpilih (native) — null = belum dipilih */
  date: Date | null;
  onDateChange: (next: Date | null) => void;
  /** Web: string YYYY-MM-DD */
  webDateStr: string;
  onWebDateStrChange: (s: string) => void;
};

export function SessionDateField({
  date,
  onDateChange,
  webDateStr,
  onWebDateStrChange,
}: Props) {
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [draft, setDraft] = useState(() => date ?? new Date());

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    const list: number[] = [];
    for (let i = y - 2; i <= y + 5; i += 1) list.push(i);
    return list;
  }, []);

  const openPicker = () => {
    setDraft(date ?? new Date());
    setModalVisible(true);
  };

  const confirmDraft = () => {
    onDateChange(draft);
    setModalVisible(false);
  };

  const clearDate = () => {
    onDateChange(null);
    onWebDateStrChange('');
  };

  const y = draft.getFullYear();
  const m = draft.getMonth();
  const maxDay = daysInMonth(y, m);
  const days = useMemo(() => {
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [maxDay]);

  const setYear = (year: number) => {
    const d = Math.min(draft.getDate(), daysInMonth(year, m));
    setDraft(new Date(year, m, d));
  };

  const setMonthIndex = (monthIndex: number) => {
    const d = Math.min(draft.getDate(), daysInMonth(y, monthIndex));
    setDraft(new Date(y, monthIndex, d));
  };

  const setDay = (day: number) => {
    setDraft(new Date(y, m, day));
  };

  const dateDisplay =
    Platform.OS === 'web'
      ? webDateStr.trim() || 'Pilih tanggal (opsional)'
      : date
        ? formatDateLabel(date)
        : 'Pilih tanggal (opsional)';

  if (Platform.OS === 'web') {
    return (
      <View>
        <Text style={styles.label}>Tanggal (opsional)</Text>
        <TextInput
          value={webDateStr}
          onChangeText={onWebDateStrChange}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="rgba(0,0,0,0.4)"
          style={[styles.input, styles.inputDate]}
        />
      </View>
    );
  }

  return (
    <View>
      <Text style={styles.label}>Tanggal (opsional)</Text>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.dateField, pressed && { opacity: 0.85 }]}>
        <Text
          style={[styles.dateFieldText, !date && styles.dateFieldPlaceholder]}>
          {dateDisplay}
        </Text>
        <Ionicons name="calendar-outline" size={22} color={authColors.black} />
      </Pressable>
      {date ? (
        <Pressable onPress={clearDate} style={styles.clearDate}>
          <Text style={styles.clearDateText}>Hapus tanggal</Text>
        </Pressable>
      ) : null}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setModalVisible(false)} hitSlop={8}>
                <Text style={styles.modalBtn}>Batal</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Tanggal</Text>
              <Pressable onPress={confirmDraft} hitSlop={8}>
                <Text style={[styles.modalBtn, styles.modalBtnPrimary]}>Selesai</Text>
              </Pressable>
            </View>
            <View style={styles.pickerRow}>
              <ScrollView
                style={styles.pickerCol}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerColContent}>
                {years.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => setYear(year)}
                    style={[
                      styles.pickerItem,
                      year === y && styles.pickerItemSelected,
                    ]}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        year === y && styles.pickerItemTextSelected,
                      ]}>
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView
                style={styles.pickerColWide}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerColContent}>
                {BULAN.map((label, idx) => (
                  <Pressable
                    key={label}
                    onPress={() => setMonthIndex(idx)}
                    style={[styles.pickerItem, idx === m && styles.pickerItemSelected]}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        idx === m && styles.pickerItemTextSelected,
                      ]}
                      numberOfLines={1}>
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              <ScrollView
                style={styles.pickerCol}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.pickerColContent}>
                {days.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => setDay(day)}
                    style={[
                      styles.pickerItem,
                      day === draft.getDate() && styles.pickerItemSelected,
                    ]}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        day === draft.getDate() && styles.pickerItemTextSelected,
                      ]}>
                      {day}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: authColors.black,
    opacity: 0.55,
    marginBottom: 6,
  },
  input: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: authColors.surface,
  },
  inputDate: {
    maxWidth: 200,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: authColors.surface,
  },
  dateFieldText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    flex: 1,
  },
  dateFieldPlaceholder: {
    opacity: 0.45,
  },
  clearDate: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  clearDateText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: authColors.primary,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  modalSheet: {
    backgroundColor: authColors.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: authColors.border,
  },
  modalTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: authColors.black,
  },
  modalBtn: {
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: authColors.black,
  },
  modalBtnPrimary: {
    fontFamily: fontFamily.bold,
    color: authColors.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    maxHeight: 260,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  pickerCol: {
    flex: 1,
  },
  pickerColWide: {
    flex: 1.6,
  },
  pickerColContent: {
    paddingBottom: 24,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  pickerItemText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: authColors.black,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontFamily: fontFamily.bold,
    color: authColors.primary,
  },
});
