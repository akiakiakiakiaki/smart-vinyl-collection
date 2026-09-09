'use client';

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#0d47a1' },
    secondary: { main: '#4a148c' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          '&.MuiButton-colorPrimary': {
            color: '#ffffff',
            backgroundColor: '#0d47a1',
          },
          '&.MuiButton-colorPrimary:hover': {
            backgroundColor: '#093579',
          },
          '&.MuiButton-colorPrimary.Mui-disabled': {
            color: '#ffffff',
            backgroundColor: '#0d47a1',
            opacity: 1,
            cursor: 'not-allowed',
          },
          '&.MuiButton-colorSecondary': {
            color: '#ffffff',
            backgroundColor: '#4a148c',
          },
          '&.MuiButton-colorSecondary:hover': {
            backgroundColor: '#300d5c',
          },
          '&.MuiButton-colorSecondary.Mui-disabled': {
            color: '#ffffff',
            backgroundColor: '#4a148c',
            opacity: 1,
            cursor: 'not-allowed',
          },
        },
      },
    },
  },
});
export default theme;
