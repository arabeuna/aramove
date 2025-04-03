import React from 'react';

export default function CallDialog({ isOpen, onClose, driver }) {
  if (!isOpen) return null;

  const handleCall = () => {
    // Formatar número para link de telefone
    const phoneNumber = '+5511999999999'; // Exemplo - será substituído pelo número real do motorista
    window.location.href = `tel:${phoneNumber}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <h3 className="text-lg font-medium">{driver?.name}</h3>
          <p className="text-gray-500">{driver?.car?.plate}</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCall}
            className="w-full py-3 bg-green-500 text-white font-medium rounded-lg flex items-center justify-center"
          >
            <span className="mr-2">📞</span>
            Ligar para motorista
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg"
          >
            Cancelar
          </button>

          <div className="text-center text-sm text-gray-500">
            <p>Sua privacidade é importante</p>
            <p>Seu número será mascarado durante a chamada</p>
          </div>
        </div>
      </div>
    </div>
  );
} 