import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Cargar preferencias guardadas del localStorage
    const savedPreferences = localStorage.getItem('cookieConsent');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences(parsed);
        setHasConsented(true);
      } catch (error) {
        console.error('Error parsing cookie preferences:', error);
      }
    }
  }, []);

  const updatePreferences = (newPreferences: Partial<CookiePreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    localStorage.setItem('cookieConsent', JSON.stringify(updated));
    setHasConsented(true);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setHasConsented(true);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setHasConsented(true);
  };

  const clearConsent = () => {
    localStorage.removeItem('cookieConsent');
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    });
    setHasConsented(false);
  };

  // Verificar si se pueden usar cookies específicas
  const canUseAnalytics = () => preferences.analytics && hasConsented;
  const canUseMarketing = () => preferences.marketing && hasConsented;
  const canUsePreferences = () => preferences.preferences && hasConsented;

  return {
    preferences,
    hasConsented,
    updatePreferences,
    acceptAll,
    rejectAll,
    clearConsent,
    canUseAnalytics,
    canUseMarketing,
    canUsePreferences,
  };
}
