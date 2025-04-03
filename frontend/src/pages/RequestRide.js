import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAR_TYPES } from '../config/cars';
import { useAuth } from '../contexts/AuthContext';

export default function RequestRide() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [step, setStep] = useState('address'); // address -> price -> confirmation
  const [rideData, setRideData] = useState({
    origin: '',
    destination: '',
    originLatLng: null,
    destinationLatLng: null,
    distance: null,
    duration: null,
    distanceValue: null, // valor em metros
    prices: {
      economic: null,
      comfort: null
    },
    selectedPrice: null,
    selectedType: null
  });

  const mapRef = useRef(null);
  const originInputRef = useRef(null);
  const destinationInputRef = useRef(null);

  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Adicione esta função para calcular preços
  const calculatePrices = (distance) => {
    if (!distance) {
      return Object.fromEntries(
        Object.entries(CAR_TYPES).map(([type, config]) => [
          type,
          config.basePrice.toFixed(2)
        ])
      );
    }

    const distanceInKm = distance / 1000;
    
    return Object.fromEntries(
      Object.entries(CAR_TYPES).map(([type, config]) => [
        type,
        (config.basePrice + (distanceInKm * config.pricePerKm)).toFixed(2)
      ])
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Verificar se é um motorista tentando solicitar corrida
    if (user?.role === 'driver') {
      alert('Motoristas não podem solicitar corridas. Por favor, faça login como passageiro.');
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Inicializar autocomplete para origem e destino
    if (window.google) {
      const originAutocomplete = new window.google.maps.places.Autocomplete(
        originInputRef.current
      );
      const destinationAutocomplete = new window.google.maps.places.Autocomplete(
        destinationInputRef.current
      );

      originAutocomplete.addListener('place_changed', () => {
        const place = originAutocomplete.getPlace();
        if (place.geometry) {
          setRideData(prev => ({
            ...prev,
            origin: place.formatted_address,
            originLatLng: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));
        }
      });

      destinationAutocomplete.addListener('place_changed', () => {
        const place = destinationAutocomplete.getPlace();
        if (place.geometry) {
          setRideData(prev => ({
            ...prev,
            destination: place.formatted_address,
            destinationLatLng: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          }));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (rideData.originLatLng && rideData.destinationLatLng) {
      setIsLoading(true);
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 12,
          center: rideData.originLatLng,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false
        });

        const directionsService = new window.google.maps.DirectionsService();
        const directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          suppressMarkers: false
        });

        directionsService.route(
          {
            origin: rideData.originLatLng,
            destination: rideData.destinationLatLng,
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            setIsLoading(false);
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
              const route = result.routes[0];
              const prices = calculatePrices(route.legs[0].distance.value);

              setRideData(prev => ({
                ...prev,
                distance: route.legs[0].distance.text,
                duration: route.legs[0].duration.text,
                distanceValue: route.legs[0].distance.value,
                prices
              }));
            } else {
              setMapError('Erro ao calcular a rota. Tente novamente.');
            }
          }
        );
      } catch (error) {
        setIsLoading(false);
        setMapError('Erro ao carregar o mapa. Tente novamente.');
      }
    }
  }, [rideData.originLatLng, rideData.destinationLatLng]);

  const handleBack = () => {
    if (step === 'price') {
      setStep('address');
    } else if (step === 'confirmation') {
      setStep('price');
    } else {
      navigate(-1);
    }
  };

  const canProceed = rideData.origin && rideData.destination;

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-brand p-4 flex items-center">
        <button 
          onClick={handleBack}
          className="text-white p-2"
        >
          ←
        </button>
        <h1 className="ml-2 text-lg font-medium text-white">Solicitar corrida</h1>
      </header>

      <main className="p-4">
        {step === 'address' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                ref={originInputRef}
                type="text"
                placeholder="Origem"
                className="w-full p-3 bg-gray-100 rounded-lg"
              />
            </div>
            <div className="relative">
              <input
                ref={destinationInputRef}
                type="text"
                placeholder="Destino"
                className="w-full p-3 bg-gray-100 rounded-lg"
              />
            </div>
            
            {/* Mapa */}
            <div 
              ref={mapRef} 
              className="w-full h-64 bg-gray-100 rounded-lg relative"
            >
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              )}
              {mapError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                  <p className="text-red-600">{mapError}</p>
                </div>
              )}
            </div>

            {rideData.distance && (
              <div className="bg-gray-100 p-3 rounded-lg">
                <p>Distância: {rideData.distance}</p>
                <p>Tempo estimado: {rideData.duration}</p>
              </div>
            )}

            <button
              onClick={() => {
                const prices = calculatePrices(rideData.distanceValue);
                setRideData(prev => ({
                  ...prev,
                  prices
                }));
                setStep('price');
              }}
              disabled={!canProceed}
              className={`w-full py-3 ${
                canProceed ? 'bg-brand' : 'bg-gray-300'
              } text-white font-medium rounded-lg`}
            >
              Buscar motoristas
            </button>
          </div>
        )}

        {step === 'price' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-2">Opções disponíveis</h2>
              <div className="space-y-3">
                {Object.entries(CAR_TYPES).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => {
                      setRideData(prev => ({
                        ...prev,
                        selectedPrice: prev.prices[type],
                        selectedType: type
                      }));
                      setStep('confirmation');
                    }}
                    className="w-full p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-4xl w-16 h-16 flex items-center justify-center">
                        {config.icon}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{config.name}</p>
                            <p className="text-sm text-gray-500">{rideData.duration || '5-7 min'}</p>
                            <p className="text-xs text-gray-400">{config.examples}</p>
                          </div>
                          <p className="font-medium">
                            R$ {rideData.prices[type]?.replace('.', ',')}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {config.features.map((feature, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-gray-100 px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-medium mb-4">Confirmar corrida</h2>
              <div className="space-y-2">
                <p><strong>Origem:</strong> {rideData.origin}</p>
                <p><strong>Destino:</strong> {rideData.destination}</p>
                <p><strong>Distância:</strong> {rideData.distance || 'Não calculada'}</p>
                <p><strong>Tempo estimado:</strong> {rideData.duration || 'Não calculado'}</p>
                <p><strong>Tipo:</strong> {rideData.selectedType === 'economic' ? 'Econômico' : 'Conforto'}</p>
                <p><strong>Preço:</strong> R$ {typeof rideData.selectedPrice === 'number' ? 
                  rideData.selectedPrice.toFixed(2) : rideData.selectedPrice}</p>
              </div>
              <button
                onClick={() => {
                  navigate('/ride/waiting');
                }}
                className="w-full mt-4 py-3 bg-brand text-white font-medium rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 