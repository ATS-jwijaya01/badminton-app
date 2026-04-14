import { authColors } from '@/constants/auth-theme';
import { fontFamily } from '@/constants/typography';

export const commonStyles = {
  screenRoot: {
    flex: 1,
    backgroundColor: authColors.background,
  },
  screenScroll: {
    paddingHorizontal: 20,
    paddingTop: 48,
  },
  screenScrollWide: {
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  cardSurface: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.surface,
  },
  cardSurfaceCompact: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: authColors.border,
    backgroundColor: authColors.surface,
  },
  sectionTitleCaps: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: authColors.black,
    opacity: 0.5,
  },
  formLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: authColors.black,
    opacity: 0.55,
    marginBottom: 6,
  },
  inputBase: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: authColors.black,
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: authColors.inputBg,
  },
  primaryButton: {
    backgroundColor: authColors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.white,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: authColors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: authColors.surface,
  },
  secondaryButtonText: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: authColors.black,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: authColors.divider,
  },
  modalBackdropCentered: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    padding: 24,
  },
  modalSheet: {
    backgroundColor: authColors.surface,
    borderRadius: 14,
  },
} as const;
