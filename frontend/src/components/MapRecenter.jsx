import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';

const MapRecenter = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  return null;
};

export default MapRecenter;
