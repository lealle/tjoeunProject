// getRoutePath.js
export async function getRoutePath(origin, destination, travelMode = "WALKING") {
  return new Promise((resolve, reject) => {
    const service = new google.maps.DirectionsService();

    service.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status !== "OK") {
          console.warn("⚠️ Directions API 실패:", status);
          return reject(status);
        }

        const route = result.routes[0].overview_path;
        resolve(route.map((p) => ({ lat: p.lat(), lng: p.lng() })));
      }
    );
  });
}
