import React from 'react';
import { useDriver } from '../../contexts/DriverContext';
import { toast } from 'react-hot-toast';
import logger from '../../../utils/logger';

const ActiveRide = ({ ride }) => {
  const { updateRideStatus } = useDriver();

  const handleArrived = async () => {
    try {
      logger.debug('Indicando chegada ao local:', ride._id);
      await toast.promise(
        updateRideStatus(ride._id, 'collecting'),
        {
          loading: 'Atualizando status...',
          success: 'Chegada registrada!',
          error: (err) => `Erro ao atualizar status: ${err.message}`
        }
      );
    } catch (error) {
      logger.error('Erro ao indicar chegada:', error);
    }
  };

  const handleStart = async () => {
    try {
      logger.debug('Iniciando corrida:', ride._id);
      await toast.promise(
        updateRideStatus(ride._id, 'in_progress'),
        {
          loading: 'Iniciando corrida...',
          success: 'Corrida iniciada!',
          error: (err) => `Erro ao iniciar corrida: ${err.message}`
        }
      );
    } catch (error) {
      logger.error('Erro ao iniciar corrida:', error);
    }
  };

  const handleComplete = async () => {
    try {
      logger.debug('Finalizando corrida:', ride._id);
      await toast.promise(
        updateRideStatus(ride._id, 'completed'),
        {
          loading: 'Finalizando corrida...',
          success: 'Corrida finalizada!',
          error: (err) => `Erro ao finalizar corrida: ${err.message}`
        }
      );
    } catch (error) {
      logger.error('Erro ao finalizar corrida:', error);
    }
  };

  const renderActionButton = () => {
    switch (ride.status) {
      case 'accepted':
        return (
          <button
            onClick={handleArrived}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Cheguei ao Local
          </button>
        );
      
      case 'collecting':
        return (
          <button
            onClick={handleStart}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Iniciar Corrida
          </button>
        );
      
      case 'in_progress':
        return (
          <button
            onClick={handleComplete}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Finalizar Corrida
          </button>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Corrida em Andamento</h3>
        <p className="text-gray-600">
          Status: {ride.status}
        </p>
      </div>

      {/* Informações do passageiro */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium">{ride.passenger.name}</p>
        <p className="text-sm text-gray-500">{ride.passenger.phone}</p>
      </div>

      {/* Botão de ação baseado no status */}
      {renderActionButton()}
    </div>
  );
};

export default ActiveRide; 