import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from './EmojiPicker';

const QUICK_MESSAGES = [
  'Estou chegando!',
  'Ok, aguardando',
  'Pode me ligar?',
  'Estou no local'
];

export default function Chat({ isOpen, onClose, driver }) {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Olá, estou a caminho!', sender: 'driver', time: '14:30', read: true },
    { id: 2, text: 'Ok, estou aguardando', sender: 'user', time: '14:31', read: true }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString().slice(0, 5),
      read: false
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const response = {
        id: Date.now() + 1,
        text: 'Mensagem recebida!',
        sender: 'driver',
        time: new Date().toLocaleTimeString().slice(0, 5),
        read: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const message = {
          id: Date.now(),
          type: 'image',
          url: reader.result,
          sender: 'user',
          time: new Date().toLocaleTimeString().slice(0, 5),
          read: false
        };
        setMessages(prev => [...prev, message]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:w-96 sm:rounded-lg sm:max-h-[600px] h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-brand text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div>
              <h3 className="font-medium">{driver?.name || 'Motorista'}</h3>
              <p className="text-sm opacity-90">{driver?.car?.plate}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2">✕</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user'
                    ? 'bg-brand text-white rounded-br-none'
                    : 'bg-gray-100 rounded-bl-none'
                }`}
              >
                {message.type === 'image' ? (
                  <img src={message.url} alt="Imagem" className="rounded" />
                ) : (
                  <p>{message.text}</p>
                )}
                <div className="flex items-center justify-end space-x-1 mt-1">
                  <p className={`text-xs ${
                    message.sender === 'user' ? 'text-white/70' : 'text-gray-500'
                  }`}>
                    {message.time}
                  </p>
                  {message.sender === 'user' && (
                    <span className="text-xs text-white/70">
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
                Digitando...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Messages */}
        {showQuickMessages && (
          <div className="p-2 border-t grid grid-cols-2 gap-2">
            {QUICK_MESSAGES.map(msg => (
              <button
                key={msg}
                onClick={() => {
                  setNewMessage(msg);
                  setShowQuickMessages(false);
                }}
                className="p-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 text-left"
              >
                {msg}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowQuickMessages(!showQuickMessages)}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              ⚡
            </button>
            <EmojiPicker onSelect={handleEmojiSelect} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              📎
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-brand text-white rounded-lg disabled:opacity-50"
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 