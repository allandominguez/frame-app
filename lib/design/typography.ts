import { FontFamily } from './fonts'

export const Typography = {
  displayXl: {
    fontFamily: FontFamily.serif,
    fontSize: 48,
    lineHeight: 58,
  },
  displayMd: {
    fontFamily: FontFamily.serif,
    fontSize: 22,
    lineHeight: 26,
  },
  bodyLg: {
    fontFamily: FontFamily.serif,
    fontSize: 17,
    lineHeight: 26,
  },
  labelMd: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  labelSm: {
    fontFamily: FontFamily.sans,
    fontSize: 13,
    lineHeight: 20,
  },
  labelSmMedium: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 13,
    lineHeight: 20,
  },
  labelXs: {
    fontFamily: FontFamily.sans,
    fontSize: 11,
    lineHeight: 17,
  },
} as const
