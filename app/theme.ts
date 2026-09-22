'use client';

import { createTheme } from '@mui/material/styles';
import { APP_BREAKPOINTS } from './breakpoints';

const theme = createTheme({
  breakpoints: {
    values: APP_BREAKPOINTS,
  },
  cssVariables: { colorSchemeSelector: 'data' },
  typography: {
    h1: {
      fontSize: '2rem',
      lineHeight: 1.15,
      [`@media (min-width: ${APP_BREAKPOINTS.md}px)`]: {
        fontSize: '2.75rem',
      },
    },
    h2: {
      fontSize: '1.5rem',
      lineHeight: 1.25,
      [`@media (min-width: ${APP_BREAKPOINTS.md}px)`]: {
        fontSize: '2rem',
      },
    },
    h4: {
      fontSize: '1.5rem',
      lineHeight: 1.2,
      [`@media (min-width: ${APP_BREAKPOINTS.md}px)`]: {
        fontSize: '2.125rem',
      },
    },
    h6: {
      fontSize: '1.125rem',
      lineHeight: 1.3,
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
  },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#0d47a1' },
        secondary: { main: '#4a148c' },
      },
    },
    dark: {
      palette: {
        primary: { main: '#90caf9' },
        secondary: { main: '#ce93d8' },
      },
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: ({ theme }) => ({
          '&.MuiButton-colorPrimary': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
          },
          '&.MuiButton-colorPrimary:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
          '&.MuiButton-colorPrimary.Mui-disabled': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.5,
            cursor: 'not-allowed',
          },
          '&.MuiButton-colorSecondary': {
            color: theme.palette.secondary.contrastText,
            backgroundColor: theme.palette.secondary.main,
          },
          '&.MuiButton-colorSecondary:hover': {
            backgroundColor: theme.palette.secondary.dark,
          },
          '&.MuiButton-colorSecondary.Mui-disabled': {
            color: theme.palette.secondary.contrastText,
            backgroundColor: theme.palette.secondary.main,
            opacity: 0.5,
            cursor: 'not-allowed',
          },
        }),
      },
    },
  },
});
export default theme;
