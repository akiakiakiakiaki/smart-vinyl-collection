'use client';

import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';
import { useColorModeStore } from '@/store/useColorModeStore';

export default function ColorModeSwitch() {
  const t = useTranslations('theme');
  const { mode, systemMode, setMode } = useColorScheme();
  const setPreference = useColorModeStore((state) => state.setMode);

  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDark = resolvedMode === 'dark';
  const label = isDark ? t('switchToLight') : t('switchToDark');

  const handleToggle = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setPreference(nextMode);
    setMode(nextMode);
  };

  if (mode === undefined || (mode === 'system' && systemMode === undefined)) {
    return null;
  }

  return (
    <Tooltip title={label}>
      <IconButton
        color="inherit"
        aria-label={label}
        onClick={handleToggle}
        size="small"
      >
        {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
