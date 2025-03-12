import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const YourPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          50: '{pink.50}',
          100: '{pink.100}',
          200: '{pink.200}',
          300: '{pink.300}',
          400: '{pink.400}',
          500: '{pink.500}',
          600: '{pink.600}',
          700: '{pink.700}',
          800: '{pink.800}',
          900: '{pink.900}',
          950: '{pink.950}',
        },
        highlight: {
          background: '{purple.700}',
          focusBackground: '{zinc.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
        custom: {
          cardcolor: '{blue.500}',
        }
      },
      dark: {
        primary: {
          50: '{indigo.50}',
          100: '{indigo.100}',
          200: '{indigo.200}',
          300: '{indigo.300}',
          400: '{indigo.400}',
          500: '{indigo.500}',
          600: '{indigo.600}',
          700: '{indigo.700}',
          800: '{indigo.800}',
          900: '{indigo.900}',
          950: '{indigo.950}',
        },
        highlight: {
          background: 'rgba(250, 250, 250, .16)',
          focusBackground: 'rgba(250, 250, 250, .24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        custom: {
          cardcolor: '{green.500}',
        }
      },
    },
  },
});

export default YourPreset;
