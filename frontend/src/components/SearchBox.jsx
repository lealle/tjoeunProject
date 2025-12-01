import React, { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import './SearchBox.css';

const SearchBox = ({ onPlaceSelect }) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
  const inputRef = useRef(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'place_id', 'rating', 'user_ratings_total']
    };

    setPlaceAutocomplete(
      new places.Autocomplete(inputRef.current, options)
    );
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      const place = placeAutocomplete.getPlace();
      onPlaceSelect(place);
      inputRef.current.value = '';
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="searchbox-container">
      <input
        ref={inputRef}
        placeholder="장소 검색 (예: 해운대, 롯데월드)"
        className="searchbox-input"
      />
    </div>
  );
};

export default SearchBox;
