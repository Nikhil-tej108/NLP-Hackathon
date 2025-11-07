import axios from 'axios';

const BACKEND_URL = 'http://localhost:8000';  // Update this with your backend URL

export const translateText = async (text, sourceLang, targetLang) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/translate`, {
      text: text,
      target_lang: targetLang
    });

    if (response.data.error) {
      throw new Error(response.data.error);
    }

    return response.data.translated_text;
  } catch (error) {
    console.error('Translation error:', error);
    return `[Error: ${error.message}]`;
  }
};
