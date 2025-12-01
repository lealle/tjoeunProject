/* global google */
import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const HandleMapIdle = ({ onIdle }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const listener = map.addListener('idle', onIdle);

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
    };
  }, [map, onIdle]);

  return null;
};

export default HandleMapIdle;
