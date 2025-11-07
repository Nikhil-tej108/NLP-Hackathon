import React from 'react';

const LanguageSelector = ({ selectedLang, onLanguageChange, position = 'input' }) => {
  const languages = [
    { code: 'hindi', label: 'Hindi' },
    { code: 'tamil', label: 'Tamil' },
    { code: 'telugu', label: 'Telugu' },
    { code: 'bengali', label: 'Bengali' },
    { code: 'marathi', label: 'Marathi' },
    { code: 'gujarati', label: 'Gujarati' },
    { code: 'kannada', label: 'Kannada' },
    { code: 'malayalam', label: 'Malayalam' },
  ];

  if (position === 'input') {
    return (
      <div className="language-badge">
        <select
          value={selectedLang}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="language-select-input"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <select
      value={selectedLang}
      onChange={(e) => onLanguageChange(e.target.value)}
      className="language-dropdown"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;