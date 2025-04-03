import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Chat from '../components/Chat';
import CallDialog from '../components/CallDialog';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MapContainer = React.memo(({ onMapLoad, center }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!window.google?.maps || !mapRef.current) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 15,
      center,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false
    });

    onMapLoad(map);
  }, [onMapLoad, center]);

  return <div ref={mapRef} className="w-full h-72 bg-gray-100 rounded-lg mb-4" />;
});

export default function WaitingDriver() {
  const { token, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('searching'); // searching, found, arriving
  const [driver, setDriver] = useState({
    name: 'Motorista',
    rating: 0,
    car: {
      model: '',
      color: '',
      plate: ''
    },
    eta: ''
  });
  const [driverLocation, setDriverLocation] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [ride, setRide] = useState(null);
  
  const markerRef = useRef(null);
  const routeRef = useRef(null);
  const movementTimerRef = useRef(null);
  const findDriverTimerRef = useRef(null);

  const mockDriverLocation = useMemo(() => ({
    lat: -23.5505,
    lng: -46.6333
  }), []);

  const handleMapLoad = useCallback((map) => {
    setMapInstance(map);

    const MarkerClass = window.google.maps.marker?.AdvancedMarkerElement || 
                       window.google.maps.Marker;

    const marker = new MarkerClass({
      map,
      position: mockDriverLocation,
      ...(MarkerClass === window.google.maps.Marker && {
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#9d62e1',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      })
    });

    markerRef.current = marker;
  }, [mockDriverLocation]);

  const cleanup = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (routeRef.current) {
      routeRef.current.setMap(null);
      routeRef.current = null;
    }
    if (movementTimerRef.current) {
      clearInterval(movementTimerRef.current);
    }
    if (findDriverTimerRef.current) {
      clearTimeout(findDriverTimerRef.current);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Usuário não autenticado em WaitingDriver');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const createRide = async () => {
      try {
        if (!token) {
          console.error('Token não encontrado');
          navigate('/login');
          return;
        }

        // Formatar dados corretamente
        const rideData = {
          origin: {
            coordinates: [mockDriverLocation.lng, mockDriverLocation.lat],
            address: 'Rua Exemplo, 123'
          },
          destination: {
            coordinates: [
              mockDriverLocation.lng + 0.01, 
              mockDriverLocation.lat + 0.01
            ],
            address: 'Av. Destino, 456'
          },
          price: 25.50
        };

        console.log('Enviando dados da corrida:', rideData); // Debug

        const response = await api.post('/rides', rideData);
        console.log('Resposta da criação:', response.data); // Debug
        
        setRide(response.data);
      } catch (error) {
        console.error('Erro ao criar corrida:', error.response?.data || error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          navigate('/passenger/dashboard', { 
            state: { 
              error: 'Erro ao criar corrida. Tente novamente.' 
            }
          });
        }
      }
    };

    if (isAuthenticated) {
      createRide();
    }
  }, [isAuthenticated, token, navigate, mockDriverLocation]);

  const MAX_RETRIES = 10; // Máximo de tentativas
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!mapInstance || !markerRef.current || !ride) return;

    const findDriver = async () => {
      try {
        console.log('Buscando motorista para corrida:', ride);
        
        // Verificar se a corrida já não foi aceita
        if (ride.status !== 'pending') {
          console.log('Corrida já foi aceita ou está em outro estado:', ride.status);
          return;
        }
        
        // Buscar motoristas disponíveis
        const response = await api.get('/drivers/available');
        const drivers = response.data;
        
        if (drivers && drivers.length > 0) {
          const driver = drivers[0];
          console.log('Motorista encontrado:', driver);
          
          try {
            // Tentar fazer o motorista aceitar a corrida
            const acceptResponse = await api.put(`/rides/${ride._id}/accept`, {
              driverId: driver._id // Enviando ID do motorista mockado
            });
            
            console.log('Resposta do aceite:', acceptResponse.data);
            
            // Atualizar estado com os dados do motorista
            setStatus('found');
            setDriver({
              name: driver.name,
              rating: driver.rating,
              car: driver.vehicle,
              eta: '5 min'
            });
            setRide(acceptResponse.data);
            
            return acceptResponse.data;
          } catch (error) {
            console.error('Erro ao aceitar corrida:', error.response?.data || error);
            throw error;
          }
        }
        
        console.log('Nenhum motorista disponível, tentando novamente em 5s...');
        findDriverTimerRef.current = setTimeout(findDriver, 5000);
        
      } catch (error) {
        console.error('Erro ao buscar motorista:', error);
        findDriverTimerRef.current = setTimeout(findDriver, 5000);
      }
    };

    // Só iniciar a busca se tivermos uma corrida
    if (ride) {
      findDriver();
    }

    return () => {
      if (findDriverTimerRef.current) {
        clearTimeout(findDriverTimerRef.current);
      }
    };
  }, [mapInstance, ride]);

  // Atualizar rota
  useEffect(() => {
    if (!mapInstance || status !== 'found' || !driverLocation) return;

    try {
      if (routeRef.current) {
        routeRef.current.setMap(null);
      }

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#9d62e1',
          strokeWeight: 5
        }
      });

      routeRef.current = directionsRenderer;

      const destination = {
        lat: mockDriverLocation.lat + 0.01,
        lng: mockDriverLocation.lng + 0.01
      };

      directionsService.route({
        origin: driverLocation,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK' && routeRef.current) {
          routeRef.current.setDirections(result);
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar rota:', error);
    }
  }, [status, driverLocation, mapInstance]);

  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar a corrida?')) {
      navigate('/passenger/dashboard', { 
        state: { message: 'Corrida cancelada com sucesso' }
      });
    }
  };

  const handleFinishRide = async () => {
    try {
      if (!ride?._id) return;
      
      const response = await api.post(`/rides/${ride._id}/complete`);
      
      if (response.data) {
        // Atualizar estado local
        setStatus('completed');
        setRide(response.data);
        
        // Redirecionar para tela de avaliação
        navigate(`/ride/${ride._id}/complete`, {
          state: { 
            ride: response.data,
            driver: driver
          }
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar corrida:', error);
      // Mostrar mensagem de erro ao usuário
      alert('Erro ao finalizar corrida. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand p-4">
        <h1 className="text-lg font-medium text-white">
          {status === 'searching' ? 'Buscando motorista...' : 'Motorista a caminho'}
        </h1>
      </header>

      <main className="p-4">
        <MapContainer 
          onMapLoad={handleMapLoad}
          center={mockDriverLocation}
        />

        {status === 'searching' && (
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            <div className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-12 w-12"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <p className="text-center text-gray-500 mt-4">
              Procurando motorista próximo...
              <br />
              <span className="text-sm">Aguarde enquanto encontramos o melhor motorista para você</span>
            </p>
          </div>
        )}

        {status === 'found' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div>
                <h2 className="font-medium">{driver?.name || 'Motorista'}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <span>⭐ {driver?.rating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-gray-700">
                <span className="font-medium">{driver?.car?.model}</span> • {driver?.car?.color}
              </p>
              <p className="text-gray-700 font-medium">{driver?.car?.plate}</p>
              <p className="text-gray-500">Chegada em {driver?.eta}</p>
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => setIsChatOpen(true)}
                className="flex-1 py-3 bg-gray-100 text-black font-medium rounded-lg"
              >
                Mensagem
              </button>
              <button 
                onClick={() => setIsCallDialogOpen(true)}
                className="flex-1 py-3 bg-gray-100 text-black font-medium rounded-lg flex items-center justify-center"
              >
                <span className="mr-2">📞</span>
                Ligar
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleCancel}
          className="w-full mt-4 py-3 bg-red-100 text-red-600 font-medium rounded-lg"
        >
          Cancelar corrida
        </button>

        <button
          onClick={() => {/* TODO: Implementar chamada de emergência */}}
          className="w-full mt-2 py-3 border border-red-600 text-red-600 font-medium rounded-lg flex items-center justify-center"
        >
          <span className="mr-2">🚨</span>
          Emergência
        </button>

        {status === 'found' && (
          <button
            onClick={handleFinishRide}
            className="w-full mt-4 py-3 bg-green-500 text-white font-medium rounded-lg"
          >
            Finalizar Corrida
          </button>
        )}
      </main>

      {/* Chat */}
      <Chat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        driver={driver}
      />

      <CallDialog
        isOpen={isCallDialogOpen}
        onClose={() => setIsCallDialogOpen(false)}
        driver={driver}
      />
    </div>
  );
} 