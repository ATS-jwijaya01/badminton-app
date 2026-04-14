import { authColors, shadowCardSoft } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ label, onPress, loading, style }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.primary,
        shadowCardSoft,
        pressed && styles.primaryPressed,
        loading && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={authColors.white} />
      ) : (
        <Text style={styles.primaryLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

type OutlineButtonProps = {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
};

export function OutlineButton({ label, onPress, style }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outline,
        shadowCardSoft,
        pressed && styles.outlinePressed,
        style,
      ]}>
      <Text style={styles.outlineLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: authColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryPressed: { opacity: 0.88 },
  disabled: { opacity: 0.7 },
  primaryLabel: {
    fontFamily: fontFamily.bold,
    color: authColors.white,
    fontSize: 16,
  },
  outline: {
    backgroundColor: authColors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.border,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  outlinePressed: { opacity: 0.92 },
  outlineLabel: {
    fontFamily: fontFamily.bold,
    color: authColors.black,
    fontSize: 16,
  },
});
