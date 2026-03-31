import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../data/translations';

export function useTranslation() {
  const { currentUser } = useAuth();
  const lang = currentUser?.language || 'km';

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  return { t, lang };
}
