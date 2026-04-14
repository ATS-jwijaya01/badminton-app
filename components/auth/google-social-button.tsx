import { authColors, shadowCardSoft } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import { FontAwesome } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
};

export function GoogleSocialButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.btn, shadowCardSoft, pressed && { opacity: 0.85 }]}>
      <View style={styles.iconWrap}>
        <FontAwesome name="google" size={20} color={authColors.black} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.surface,
    paddingVertical: 14,
    minHeight: 52,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  label: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.black,
  },
});
