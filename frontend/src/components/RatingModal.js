import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RATING_TAGS = {
  driver: [
    { id: 'pontual', text: 'Pontual' },
    { id: 'cordial', text: 'Cordial' },
    { id: 'carro_limpo', text: 'Carro Limpo' },
    { id: 'direção_segura', text: 'Direção Segura' },
    { id: 'profissional', text: 'Profissional' }
  ],
  passenger: [
    { id: 'pontual', text: 'Pontual' },
    { id: 'educado', text: 'Educado' },
    { id: 'respeitoso', text: 'Respeitoso' }
  ]
};

export default function RatingModal({ isOpen, onClose, ride, userType, onSubmit }) {
  const [rating, setRating] = useState({ stars: 0, comment: '', tags: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(rating);
      onClose();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (stars) => {
    setRating(prev => ({ ...prev, stars }));
  };

  const handleTagToggle = (tagId) => {
    setRating(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Avalie sua viagem</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Estrelas */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                className="text-2xl focus:outline-none"
              >
                <FaStar 
                  className={star <= rating.stars ? 'text-yellow-400' : 'text-gray-300'} 
                />
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <p className="font-medium">O que você achou?</p>
            <div className="flex flex-wrap gap-2">
              {RATING_TAGS[userType === 'driver' ? 'passenger' : 'driver'].map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    rating.tags.includes(tag.id)
                      ? 'bg-brand text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tag.text}
                </button>
              ))}
            </div>
          </div>

          {/* Comentário */}
          <div>
            <textarea
              value={rating.comment}
              onChange={(e) => setRating(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Deixe um comentário (opcional)"
              className="w-full p-2 border rounded-lg resize-none h-24"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!rating.stars || isSubmitting}
              className="flex-1 py-2 bg-brand text-white rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 