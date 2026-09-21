'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
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
