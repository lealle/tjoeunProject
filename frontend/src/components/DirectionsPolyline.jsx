// components/DirectionsPolyline.jsx
import { calcDistance } from "../utils/calcDistance";
import { getRoutePath } from "../utils/getRoutePath";
import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

const DirectionsPolyline = ({ origin, destination, color }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !origin || !destination) return;

    let polylineInstance = null;

    const fetchRoute = async () => {
      try {
        // 1) 거리 계산
        const distance = calcDistance(
          origin.lat, origin.lng,
          destination.lat, destination.lng
        );

        console.log("📏 거리(m):", Math.round(distance));

        // 2) 거리 기반 이동 방식 선택
        let mode;
        if (distance <= 500) {
          mode = "WALKING";
        } else {
          mode = "TRANSIT"; // 대중교통
        }

        console.log("🚶 이동 방식:", mode);

        // 3) 실제 경로 요청
        const path = await getRoutePath(origin, destination, mode);

        if (!path || path.length === 0) {
          console.warn("⚠️ 경로가 존재하지 않음");
          return;
        }

        // 4) Polyline 그리기
        polylineInstance = new window.google.maps.Polyline({
          path,
          strokeColor: color,
          strokeOpacity: 1.0,
          strokeWeight: 4,
          map,
        });
      } catch (err) {
        console.error("경로 생성 실패:", err);
      }
    };

    fetchRoute();

    return () => {
      if (polylineInstance) polylineInstance.setMap(null);
    };
  }, [map, origin, destination, color]);

  return null;
};

export default DirectionsPolyline;
