import React from 'react';

const LanguageSelector = ({ 
  selectedLang, 
  onLanguageChange, 
  position,
  disabled = false 
}) => {
  const languages = [
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' }
  ];

  const selectedLanguage = languages.find(lang => lang.code === selectedLang);

  return (
    <div className={`language-selector ${position}`}>
      <select
        value={selectedLang}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="language-dropdown"
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;