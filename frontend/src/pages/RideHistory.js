import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function RideHistory() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchRides();
  }, [filter, page]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/rides/history', {
        params: {
          status: filter !== 'all' ? filter : undefined,
          page,
          limit: 10
        }
      });
      setRides(response.data.rides);
      setPagination(response.data.pagination);
    } catch (error) {
      setError('Erro ao carregar histórico');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand p-4">
        <h1 className="text-white text-lg font-medium">Histórico de Corridas</h1>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Filtros */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
          {['all', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                filter === status
                  ? 'bg-brand text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              {status === 'all' ? 'Todas' : 
               status === 'completed' ? 'Concluídas' : 'Canceladas'}
            </button>
          ))}
        </div>

        {/* Lista de corridas */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">{error}</div>
        ) : rides.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma corrida encontrada
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <div
                key={ride._id}
                onClick={() => navigate(`/rides/${ride._id}`)}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">
                      {user.role === 'driver' ? ride.passenger.name : ride.driver?.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(ride.createdAt)}
                    </p>
                  </div>
                  <span className="text-lg font-medium">
                    R$ {ride.price.toFixed(2)}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">De:</span> {ride.origin.address}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Para:</span> {ride.destination.address}
                  </p>
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                    ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {ride.status === 'completed' ? 'Concluída' :
                     ride.status === 'cancelled' ? 'Cancelada' :
                     'Em andamento'}
                  </span>
                  {ride.rating && (
                    <div className="flex items-center text-yellow-500">
                      <span className="mr-1">★</span>
                      <span>{ride.rating.stars}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setPage(num)}
                className={`w-8 h-8 rounded-full ${
                  page === num
                    ? 'bg-brand text-white'
                    : 'bg-white text-gray-600 border'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 