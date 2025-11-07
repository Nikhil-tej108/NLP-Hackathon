import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import EmojiPicker from './components/EmojiPicker';
import WebRTCManager from './utils/webrtc';
import './styles/App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedLang, setSelectedLang] = useState('hi');
  const [emojiMode, setEmojiMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Use ref to maintain WebRTC instance across re-renders
  const webrtcManagerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Initialize WebRTC connection
  useEffect(() => {
    isMountedRef.current = true;
    let didInit = false;

    const initializeWebRTC = async () => {
      // Prevent double initialization in Strict Mode
      if (didInit) return;
      didInit = true;

      try {
        // Create manager instance only once
        if (!webrtcManagerRef.current) {
          webrtcManagerRef.current = new WebRTCManager();
        }

        const manager = webrtcManagerRef.current;

        // Initialize with current language
        await manager.init('default-room', selectedLang, (data) => {
          if (!isMountedRef.current) return;

          console.log('Received translated message:', data);

          // Determine if this is from the current user
          const isOwnMessage = data.is_sender || data.source === manager.socket?.id;

          const newMessage = {
            sender: isOwnMessage ? 'A' : 'B',
            text: isOwnMessage ? data.original : data.translated, // Show original if own message, translation if from others
            translation: data.translated,
            isVoice: false,
            hasAudio: false
          };
          
          console.log('Adding message to state:', newMessage);
          setMessages(prev => [...prev, newMessage]);
          setIsTranslating(false);
        });

        if (isMountedRef.current) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Failed to initialize WebRTC:', error);
        if (isMountedRef.current) {
          setIsConnected(false);
        }
      }
    };

    initializeWebRTC();

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      // Small delay to prevent interference with Strict Mode re-mount
      const cleanup = setTimeout(() => {
        if (webrtcManagerRef.current) {
          webrtcManagerRef.current.disconnect();
          webrtcManagerRef.current = null;
        }
      }, 100);
      
      return () => clearTimeout(cleanup);
    };
  }, []); // Only run once on mount

  // Handle language change separately
  useEffect(() => {
    const updateLanguage = async () => {
      // Skip on initial mount (already initialized above)
      if (!webrtcManagerRef.current || !isConnected) return;

      try {
        // Update the target language
        webrtcManagerRef.current.targetLanguage = selectedLang;
        webrtcManagerRef.current.onMessageCallback = (data) => {
          if (!isMountedRef.current) return;

          console.log('Received translated message:', data);

          // Determine if this is from the current user
          const isOwnMessage = data.is_sender || data.source === webrtcManagerRef.current.socket?.id;

          const newMessage = {
            sender: isOwnMessage ? 'A' : 'B',
            text: isOwnMessage ? data.original : data.translated, // Show original if own message, translation if from others
            translation: data.translated,
            isVoice: false,
            hasAudio: false
          };
          
          setMessages(prev => [...prev, newMessage]);
          setIsTranslating(false);
        };
        
        // Rejoin room with new language
        webrtcManagerRef.current.joinRoom();
        console.log('Language updated to:', selectedLang);
      } catch (error) {
        console.error('Failed to update language:', error);
      }
    };

    updateLanguage();
  }, [selectedLang, isConnected]);

  const handleLanguageChange = (newLang) => {
    setSelectedLang(newLang);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !isConnected) {
      console.warn('Cannot send message: no text or not connected');
      return;
    }

    try {
      setIsTranslating(true);
      console.log('Sending message:', inputText);
      
      // Send message through WebRTC manager
      await webrtcManagerRef.current.sendMessage(inputText);
      setInputText('');
      
      // Auto-clear translating state after 5 seconds (safety timeout)
      setTimeout(() => {
        setIsTranslating(false);
      }, 5000);
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsTranslating(false);
      // Optionally show error to user
      alert('Failed to send message. Please try again.');
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      console.log('Started recording...');
      // TODO: Implement actual voice recording
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
      {/* Connection Status Indicator (optional) */}
      {!isConnected && (
        <div style={{
          position: 'fixed',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ff6b6b',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 1000
        }}>
          Connecting to server...
        </div>
      )}

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
        onLanguageChange={handleLanguageChange}
        onSendMessage={handleSendMessage}
        isRecording={isRecording}
        onToggleRecording={handleToggleRecording}
        onEmojiClick={() => setShowEmojiPicker(true)}
        disabled={!isConnected}
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