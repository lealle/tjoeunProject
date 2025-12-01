import React from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import './SearchPlaceButton.css';

const SearchPlaceButton = ({ type, onSearchResults, setShowButton, setActiveTab }) => {
  const map = useMap();
  const placesLib = useMapsLibrary('places');

  const handleSearch = () => {
    if (!map || !placesLib) return;

    const service = new placesLib.PlacesService(map);

    const request = {
      location: map.getCenter(),
      radius: 2000,
      type: type
    };

    service.nearbySearch(request, (results, status) => {
      if (status === placesLib.PlacesServiceStatus.OK) {
        let filtered = results;

        if (type === 'restaurant') {
          filtered = results.filter(
            p =>
              p.rating &&
              p.rating >= 4.0 &&
              p.user_ratings_total &&
              p.user_ratings_total >= 100
          );
        }

        if (filtered.length === 0) {
          alert(
            type === 'restaurant'
              ? '조건(★4.0, 리뷰100+)을 만족하는 맛집이 없어요.'
              : '검색 결과가 없습니다.'
          );
          return;
        }

        const formatted = filtered.map(p => ({
          id: p.place_id,
          name: p.name,
          rating: p.rating,
          reviews: p.user_ratings_total,
          lat: p.geometry.location.lat(),
          lng: p.geometry.location.lng(),
          type: type,
          photos: p.photos,
          vicinity: p.vicinity,
        }));

        onSearchResults(formatted);
        setShowButton(false);
        setActiveTab('search');
        alert(`${formatted.length}개의 장소를 찾았습니다!`);
      }
    });
  };

  return (
    <button
      onClick={handleSearch}
      className={`searchplace-btn ${type === 'restaurant' ? 'restaurant' : 'tour'}`}
    >
      {type === 'restaurant' ? '🍝 찐맛집' : '📷 관광명소'}
    </button>
  );
};

export default SearchPlaceButton;
