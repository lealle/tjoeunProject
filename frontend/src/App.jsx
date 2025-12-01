// App.jsx (수정 완료 버전)

import React, { useState } from 'react';
import axios from 'axios';
import MapPage from './pages/MapPage';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState([]);

  /** Day별 일정 구조 */
  const [itineraryByDay, setItineraryByDay] = useState({
    day1: [],
    day2: [],
    day3: []
  });

  const [isOptimized, setIsOptimized] = useState(false);

  const [mapCenter, setMapCenter] = useState({
    lat: 37.5551,
    lng: 126.9707
  });

  const [showButton, setShowButton] = useState(false);

  const DAY_COLORS = ["#FF0000", "#2196F3", "#4CAF50"];


  /* ============================================================
     📍 장소 검색창에서 직접 검색
  ============================================================ */
  const handleManualSearch = (place) => {
    if (!place.geometry || !place.geometry.location) {
      alert("장소 정보를 가져올 수 없습니다.");
      return;
    }

    const newPlace = {
      id: place.place_id,
      name: place.name,
      rating: place.rating || 0,
      reviews: place.user_ratings_total || 0,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      type: 'searched'
    };

    setMapCenter({ lat: newPlace.lat, lng: newPlace.lng });
    setSearchResults([newPlace]);
    setActiveTab('search');
    setShowButton(false);
  };


  /* ============================================================
     📍 Day1에 기본으로 장소 추가 (최적화 이전에는 임시로 Day1에 넣음)
  ============================================================ */
  const addToItinerary = (place) => {
    // 중복 체크 (모든 day에서 검색)
    const exists = Object.values(itineraryByDay).some(dayList =>
      dayList.some(item => item.id === place.id)
    );
    if (exists) {
      alert("이미 일정에 추가된 장소입니다.");
      return;
    }

    // 일단 최적화 전에는 Day1에만 추가
    setItineraryByDay({
      ...itineraryByDay,
      day1: [...itineraryByDay.day1, place]
    });

    setIsOptimized(false);
  };


  /* ============================================================
     📍 지도 클릭 → 커스텀 장소 추가 (Day1에 추가)
  ============================================================ */
  const handleMapClick = (e) => {
    if (e.detail.latLng) {
      const lat = e.detail.latLng.lat;
      const lng = e.detail.latLng.lng;
      const name = prompt("이 장소 이름 입력");

      if (name) {
        const newPlace = {
          id: Date.now().toString(),
          name,
          lat,
          lng,
          type: 'custom'
        };

        addToItinerary(newPlace);
      }
    }
  };


  /* ============================================================
     📍 Day별 드래그앤드롭 정렬
     - normal-list (최적화 전 단일 리스트)
     - day1/day2/day3 (최적화 후 Day별 리스트)
  ============================================================ */
  const handleOnDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const { droppableId: sourceId } = source;
    const { droppableId: destId } = destination;

    // 0️⃣ 최적화 전: ItineraryListNormal 에서 오는 드래그 (droppableId: "normal-list")
    if (sourceId === "normal-list" && destId === "normal-list") {
      const items = Array.from(itineraryByDay.day1); // 최적화 전에는 day1만 사용

      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);

      setItineraryByDay({
        ...itineraryByDay,
        day1: items
      });
      setIsOptimized(false);
      return;
    }

    // 1️⃣ 최적화 이후: day1/day2/day3 사이 드래그
    const sourceDay = sourceId;   // 예: "day1"
    const destDay = destId;       // 예: "day2"

    // 방어 코드: 혹시 모르는 droppableId
    if (!itineraryByDay[sourceDay] || !itineraryByDay[destDay]) {
      console.warn("알 수 없는 droppableId:", sourceDay, destDay);
      return;
    }

    // 같은 Day 안에서 순서 변경
    if (sourceDay === destDay) {
      const items = Array.from(itineraryByDay[sourceDay] || []);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);

      setItineraryByDay({
        ...itineraryByDay,
        [sourceDay]: items
      });
      setIsOptimized(false);
      return;
    }

    // Day 간 이동
    const sourceItems = Array.from(itineraryByDay[sourceDay] || []);
    const destItems = Array.from(itineraryByDay[destDay] || []);

    const [moved] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, moved);

    setItineraryByDay({
      ...itineraryByDay,
      [sourceDay]: sourceItems,
      [destDay]: destItems
    });

    setIsOptimized(false);
  };


 /* ============================================================
   📍 3일코스 최적화 요청 → Day별로 자동 배분된 결과 생성
============================================================ */
const handleOptimize = async () => {
  console.log("🔥 handleOptimize 실행됨 시작");

  const totalPlaces = [
    ...itineraryByDay.day1,
    ...itineraryByDay.day2,
    ...itineraryByDay.day3
  ];

  try {
    const response = await axios.post("http://127.0.0.1:8000/optimize", {
      places: totalPlaces,
      days: 3
    });

    console.log("📡 백엔드 응답 도착:", response.data);

    const result = response.data?.optimized_places;
    console.log("📦 optimized_places(result):", result);

    // 🔥 백엔드 구조가 [ [..], [..], [..] ] 이므로 이렇게 처리해야 함
    const getDayPlaces = (index) => {
      const dayArr = result?.[index];
      return Array.isArray(dayArr) ? dayArr : [];
    };

    const day1 = getDayPlaces(0);
    const day2 = getDayPlaces(1);
    const day3 = getDayPlaces(2);

    console.log("📌 day1 파싱 결과:", day1);
    console.log("📌 day2 파싱 결과:", day2);
    console.log("📌 day3 파싱 결과:", day3);

    setItineraryByDay({
      day1,
      day2,
      day3,
    });

    setIsOptimized(true);
    alert("3일 코스로 최적화 완료!");

  } catch (err) {
    console.log("❌ 최적화 중 오류 발생:", err);
    alert("백엔드 오류");
  }

  console.log("🔥 handleOptimize 끝까지 실행됨");
};



  /* ============================================================
     📍 일정 삭제 (Day 안에서 삭제)
  ============================================================ */
  const removeFromItinerary = (id) => {
    const updated = {
      day1: itineraryByDay.day1.filter(item => item.id !== id),
      day2: itineraryByDay.day2.filter(item => item.id !== id),
      day3: itineraryByDay.day3.filter(item => item.id !== id),
    };
    setItineraryByDay(updated);
    setIsOptimized(false);
  };


  /* ============================================================
     📍 화면 렌더링 (MapPage로 props 전달)
  ============================================================ */
  return (
    <MapPage
      activeTab={activeTab}
      setActiveTab={setActiveTab}

      searchResults={searchResults}
      setSearchResults={setSearchResults}

      itineraryByDay={itineraryByDay}
      setItineraryByDay={setItineraryByDay}

      handleManualSearch={handleManualSearch}
      addToItinerary={addToItinerary}
      handleMapClick={handleMapClick}

      handleOnDragEnd={handleOnDragEnd}
      handleOptimize={handleOptimize}
      removeFromItinerary={removeFromItinerary}

      isOptimized={isOptimized}

      mapCenter={mapCenter}
      showButton={showButton}
      setShowButton={setShowButton}

      DAY_COLORS={DAY_COLORS}
      API_KEY={API_KEY}
    />
  );
};

export default App;
