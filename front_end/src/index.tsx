import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#e11d48', contrastText: '#ffffff' },
    secondary: { main: '#0ea5a4', contrastText: '#ffffff' },
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#475569' },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { 
      fontWeight: 800, 
      letterSpacing: '-0.03em', 
      lineHeight: 1.15, 
      fontSize: '2.75rem',
      fontFeatureSettings: '"liga" 1, "calt" 1',
    },
    h2: { 
      fontWeight: 800, 
      letterSpacing: '-0.025em', 
      lineHeight: 1.2, 
      fontSize: '2rem',
      fontFeatureSettings: '"liga" 1, "calt" 1',
    },
    h3: { 
      fontWeight: 700, 
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
      fontFeatureSettings: '"liga" 1',
    },
    h4: { 
      fontWeight: 700,
      letterSpacing: '-0.015em',
      fontFeatureSettings: '"liga" 1',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
    },
    body1: { 
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '-0.005em',
    },
    body2: {
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '-0.005em',
    },
    button: { 
      textTransform: 'none', 
      fontWeight: 600, 
      letterSpacing: '-0.01em',
      fontFeatureSettings: '"liga" 1',
    },
    subtitle1: {
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '-0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backdropFilter: 'saturate(180%) blur(10px)',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { 
          borderRadius: 12, 
          border: '1px solid #e2e8f0',
          transition: 'box-shadow 0.2s ease',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { 
          borderRadius: 10, 
          paddingInline: 14, 
          fontWeight: 700,
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(40rem 20rem at 10% 0%, rgba(225,29,72,0.06), transparent 60%), radial-gradient(30rem 16rem at 90% 10%, rgba(14,165,164,0.08), transparent 60%)',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
          fontFeatureSettings: '"liga" 1, "calt" 1',
          textRendering: 'optimizeLegibility',
        },
        '@font-face': {
          fontDisplay: 'swap',
        },
        a: { 
          textDecoration: 'none',
          fontWeight: 500,
        },
        strong: {
          fontWeight: 700,
        },
        b: {
          fontWeight: 600,
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'lg' },
    },
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);