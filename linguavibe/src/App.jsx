import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import EmojiPicker from './components/EmojiPicker';
import './styles/App.css';

function App() {
  const [messages, setMessages] = useState([
    {
      sender: 'A',
      text: 'नमस्ते. आप कसे हैं?',
      translation: 'Hello. How you (HDI)',
      isVoice: false,
      hasAudio: true
    },
    {
      sender: 'B',
      text: 'How can I assist you today?',
      translation: 'मैं अज अपदि करस समयता यवकला? (HNII) (HINDI)',
      isVoice: false,
      hasAudio: false
    },
    {
      sender: 'A',
      isVoice: true,
      isPlaying: false
    },
    {
      sender: 'B',
      isVoice: true,
      isPlaying: false
    },
    {
      sender: 'B',
      text: 'जरूरा. मेरे पास कुछ प्रश्न हैं.',
      translation: 'Sure. Have few questions.',
      hasAudio: true
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState('hindi');
  const [emojiMode, setEmojiMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Mock translation function
  const translateText = (text, targetLang) => {
    // TODO: Integrate with actual translation API
    const mockTranslations = {
      'hindi': 'यह एक अनुवाद है',
      'tamil': 'இது ஒரு மொழிபெயர்ப்பு',
      'telugu': 'ఇది ఒక అనువాదం',
      'bengali': 'এটি একটি অনুবাদ',
      'marathi': 'हे एक भाषांतर आहे',
      'gujarati': 'આ એક અનુવાદ છે',
      'kannada': 'ಇದು ಒಂದು ಅನುವಾದ',
      'malayalam': 'ഇത് ഒരു വിവർത്തനമാണ്',
    };
    return mockTranslations[targetLang] || 'Translation...';
  };

  const handleSendMessage = () => {
    if (inputText.trim()) {
      setIsTranslating(true);
      
      // Simulate translation delay
      setTimeout(() => {
        const newMessage = {
          sender: 'A',
          text: inputText,
          translation: translateText(inputText, selectedLang),
          isVoice: false,
          hasAudio: false
        };
        setMessages([...messages, newMessage]);
        setInputText('');
        setIsTranslating(false);
      }, 1000);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement actual voice recording
    if (!isRecording) {
      console.log('Started recording...');
    } else {
      console.log('Stopped recording...');
      // Simulate adding voice message
      const voiceMsg = {
        sender: 'A',
        isVoice: true,
        isPlaying: false
      };
      setMessages([...messages, voiceMsg]);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setInputText(inputText + emoji);
  };

  return (
    <div className="linguavibe-app">
      {/* Emoji Mode Toggle (Top Right) */}
      <div className="emoji-mode-container">
        <label className="emoji-mode-switch">
          <span className="emoji-mode-label">Emoji Mode</span>
          <input
            type="checkbox"
            checked={emojiMode}
            onChange={(e) => setEmojiMode(e.target.checked)}
          />
          <span className="emoji-mode-slider"></span>
        </label>
      </div>

      <ChatWindow
        messages={messages}
        emojiMode={emojiMode}
        isTranslating={isTranslating}
      />

      <InputBar
        inputText={inputText}
        setInputText={setInputText}
        selectedLang={selectedLang}
        onLanguageChange={setSelectedLang}
        onSendMessage={handleSendMessage}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        onEmojiClick={() => setShowEmojiPicker(true)}
      />

      <EmojiPicker
        show={showEmojiPicker}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setShowEmojiPicker(false)}
      />
    </div>
  );
}

export default App;