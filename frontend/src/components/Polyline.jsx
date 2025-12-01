import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const Polyline = ({ path, color }) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const [polyline, setPolyline] = useState(null);

  useEffect(() => {
    if (!map || !mapsLib || !path) return;

    const newPolyline = new mapsLib.Polyline({
      path: path,
      geodesic: true,
      strokeColor: color || "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 4,
    });

    newPolyline.setMap(map);
    setPolyline(newPolyline);

    return () => newPolyline.setMap(null);
  }, [map, mapsLib, path, color]);

  useEffect(() => {
    if (polyline) {
      polyline.setPath(path);
      polyline.setOptions({ strokeColor: color || "#FF0000" });
    }
  }, [path, color, polyline]);

  return null;
};

export default Polyline;
