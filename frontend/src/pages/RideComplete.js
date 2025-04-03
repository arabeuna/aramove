import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RatingModal from '../components/RatingModal';
import api from '../services/api';

export default function RideComplete() {
  const { rideId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Pegar dados da corrida do state ou fazer fetch
  const [ride, setRide] = useState(location.state?.ride || null);
  const [driver, setDriver] = useState(location.state?.driver || null);
  const [showRating, setShowRating] = useState(false);
  const [loading, setLoading] = useState(!location.state?.ride);

  useEffect(() => {
    if (!ride) {
      fetchRideData();
    } else {
      setShowRating(true);
    }
  }, [rideId]);

  const fetchRideData = async () => {
    try {
      const response = await api.get(`/rides/${rideId}`);
      setRide(response.data);
      setDriver(response.data.driver);
      setShowRating(true);
    } catch (error) {
      console.error('Erro ao carregar dados da corrida:', error);
      navigate('/rides/history');
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      await api.post(`/rides/${rideId}/rate`, ratingData);
      navigate('/rides/history');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Corrida Finalizada!</h1>
        
        {/* Detalhes da corrida */}
        <div className="space-y-4 mb-6">
          <div className="text-center">
            <p className="text-lg font-medium">{driver?.name}</p>
            <p className="text-gray-500">{driver?.vehicle?.plate}</p>
          </div>
          
          <div className="border-t pt-4">
            <p className="font-medium">Valor da corrida</p>
            <p className="text-2xl font-bold">R$ {ride?.price?.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={() => setShowRating(true)}
          className="w-full py-3 bg-brand text-white rounded-lg"
        >
          Avaliar corrida
        </button>
      </div>

      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        ride={ride}
        userType={user?.role}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
} 