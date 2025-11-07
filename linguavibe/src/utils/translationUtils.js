// Mock translation function for local dev and UI flow
export const translateText = async (text, sourceLang, targetLang) => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockTranslations = {
    'en-hi': {
      'Hello': 'नमस्ते',
      'How are you?': 'आप कैसे हैं?',
      'Good morning': 'सुप्रभात',
      'Thank you': 'धन्यवाद',
      'How can I help you?': 'मैं आपकी कैसे मदद कर सकता हूं?',
      'I am fine': 'मैं ठीक हूं'
    },
    'hi-en': {
      'नमस्ते': 'Hello',
      'आप कैसे हैं?': 'How are you?',
      'सुप्रभात': 'Good morning',
      'धन्यवाद': 'Thank you',
      'मैं ठीक हूं': 'I am fine',
      'मैं बहुत बढ़िया हूं': 'I am very good'
    },
    'ta-hi': {
      'எப்படி இருக்கே?': 'कैसे हो?',
      'நான் நலமாக இருக்கிறேன்': 'मैं ठीक हूं'
    },
    'hi-ta': {
      'कैसे हो?': 'எப்படி இருக்கே?',
      'मैं ठीक हूं': 'நான் நலமாக இருக்கிறேன்'
    }
  };

  const key = `${sourceLang}-${targetLang}`;
  const table = mockTranslations[key] || {};

  return table[text] || `[Translation: ${text}]`;
};
