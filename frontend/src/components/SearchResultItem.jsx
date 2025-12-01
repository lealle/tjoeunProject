import React from 'react';
import './SearchResultItem.css';

const SearchResultItem = ({ place, onAdd }) => {
  const photoUrl =
    place.photos && place.photos.length > 0
      ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 300 })
      : '/noimage.png';

  return (
    <li className="result-card">
      <img className="result-thumb" src={photoUrl} alt={place.name} />

      <div className="result-info">
        <div className="result-title">{place.name}</div>
        <div className="result-sub">{place.vicinity || '주소 정보 없음'}</div>
        <div className="result-rating">
          ⭐ {place.rating || '-'} <span>({place.reviews || 0})</span>
        </div>
      </div>

      <button className="result-add-btn" onClick={() => onAdd(place)}>
        추가
      </button>
    </li>
  );
};

export default SearchResultItem;
