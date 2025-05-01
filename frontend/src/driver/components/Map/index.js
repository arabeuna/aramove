import React, { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import logger from '../../../utils/logger';

const Map = ({ center, isOnline, currentRide }) => {
  const [directions, setDirections] = useState(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places']
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const defaultCenter = {
    lat: -16.5775095,
    lng: -49.3754792
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false,
    minZoom: 3,
    maxZoom: 20
  };

  // Função para criar os ícones após o Google Maps estar carregado
  const createIcons = () => {
    if (!window.google) return null;

    return {
      car: {
        url: '/images/car-marker.svg',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      pickup: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#2563EB',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24),
      },
      destination: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#DC2626',
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: '#ffffff',
        scale: 1.5,
        anchor: new window.google.maps.Point(12, 24),
      }
    };
  };

  // Atualizar rota baseada no status da corrida
  useEffect(() => {
    if (!currentRide || !center || !window.google) return;

    const calculateRoute = async () => {
      const directionsService = new window.google.maps.DirectionsService();

      try {
        let origin = center;
        let destination;

        switch (currentRide.status) {
          case 'accepted':
          case 'collecting':
            destination = {
              lat: currentRide.origin.lat,
              lng: currentRide.origin.lng
            };
            break;

          case 'in_progress':
            destination = {
              lat: currentRide.destination.lat,
              lng: currentRide.destination.lng
            };
            break;

          default:
            setDirections(null);
            return;
        }

        logger.debug('Calculando rota:', { origin, destination, status: currentRide.status });

        const result = await directionsService.route({
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        setDirections(result);
      } catch (error) {
        logger.error('Erro ao calcular rota:', error);
        setDirections(null);
      }
    };

    calculateRoute();
  }, [currentRide, center]);

  if (!isLoaded) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <p>Carregando mapa...</p>
      </div>
    );
  }

  const icons = createIcons();

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={center || defaultCenter}
      zoom={15}
      options={mapOptions}
    >
      {/* Marcador do motorista */}
      {center && icons && (
        <Marker
          position={center}
          icon={icons.car}
        />
      )}

      {/* Marcadores de origem e destino quando houver corrida */}
      {currentRide && icons && (
        <>
          <Marker
            position={{
              lat: currentRide.origin.lat,
              lng: currentRide.origin.lng
            }}
            icon={icons.pickup}
          />
          
          <Marker
            position={{
              lat: currentRide.destination.lat,
              lng: currentRide.destination.lng
            }}
            icon={icons.destination}
          />
        </>
      )}

      {/* Renderizar a rota */}
      {directions && <DirectionsRenderer directions={directions} />}
    </GoogleMap>
  );
};

export default React.memo(Map); 