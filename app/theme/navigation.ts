import { Theme } from '@react-navigation/native';
import { BrandColors } from './colors';

export const AppTheme: Theme = {
    dark: false,
    colors: {
        primary: BrandColors.primary,
        background: BrandColors.background,
        card: BrandColors.card,
        text: BrandColors.text,
        border: BrandColors.border,
        notification: BrandColors.accent,
    },
    fonts: {
        regular: {
            fontFamily: 'System',
            fontWeight: 'normal',
        },
        medium: {
            fontFamily: 'System',
            fontWeight: '500',
        },
        bold: {
            fontFamily: 'System',
            fontWeight: 'bold',
        },
        heavy: {
            fontFamily: 'System',
            fontWeight: '700',
        },
    },
};