import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f4ebed',
      100: '#e1ccd1',
      200: '#ceadb5',
      300: '#bb8e99',
      400: '#a86f7d',
      500: '#461B27', 
      600: '#3f1823',
      700: '#38161f',
      800: '#31131b',
      900: '#2a1117',
      950: '#230e13'
    }
  }
});
