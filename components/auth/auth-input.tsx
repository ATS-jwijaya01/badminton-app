import { authColors, shadowCardSoft } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

type AuthInputProps = TextInputProps & {
  containerStyle?: object;
};

export function AuthInput({ containerStyle, style, ...props }: AuthInputProps) {
  return (
    <View style={[styles.wrap, shadowCardSoft, containerStyle]}>
      <TextInput
        placeholderTextColor={authColors.placeholder}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: authColors.inputBorder,
    backgroundColor: authColors.surface,
    overflow: 'hidden',
  },
  input: {
    fontFamily: fontFamily.regular,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: authColors.black,
  },
});
