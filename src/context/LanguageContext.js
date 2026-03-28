import React, { createContext, useContext, useState } from 'react';
import en from '../i18n/en';
import de from '../i18n/de';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');
  const strings = lang === 'en' ? en : de;
  const toggleLang = () => setLang(prev => (prev === 'en' ? 'de' : 'en'));

  return (
    <LanguageContext.Provider value={{ lang, strings, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
