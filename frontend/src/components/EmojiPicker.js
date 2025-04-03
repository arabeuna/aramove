import React, { useState } from 'react';

const EMOJI_CATEGORIES = {
  'recent': ['👍', '👋', '😊', '🙏', '⭐'],
  'smileys': ['😊', '😂', '🤣', '😍', '😅', '😆', '😉', '😋', '😎', '🤗'],
  'gestures': ['👍', '👋', '✌️', '🤝', '👏', '🙏', '💪', '🤙', '👌', '🤞'],
  'travel': ['🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🛵', '🚲', '✈️'],
  'symbols': ['❤️', '💯', '✨', '⭐', '🎵', '💫', '💥', '💪', '👊', '💝']
};

export default function EmojiPicker({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('recent');

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700"
      >
        😊
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 w-64">
          <div className="flex border-b mb-2 pb-2 space-x-2">
            {Object.keys(EMOJI_CATEGORIES).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`p-1 text-sm rounded ${
                  category === cat ? 'bg-gray-100' : ''
                }`}
              >
                {EMOJI_CATEGORIES[cat][0]}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_CATEGORIES[category].map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  onSelect(emoji);
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 