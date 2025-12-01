import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ItineraryListOptimized = ({
  itineraryByDay,
  setItineraryByDay,
  removeFromItinerary,
  DAY_COLORS
}) => {

  /** ---------------------------------------------------------
   *  🔥 1) itineraryByDay 방어코드 (undefined 방지)
   * --------------------------------------------------------- */
  const safeData = {
    day1: itineraryByDay?.day1 || [],
    day2: itineraryByDay?.day2 || [],
    day3: itineraryByDay?.day3 || [],
  };

  /** ---------------------------------------------------------
   *  🔥 2) onDragEnd 로직
   * --------------------------------------------------------- */
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceDay = source.droppableId;     // "day1"
    const destDay = destination.droppableId;  // "day2"

    // 복사본 준비 (원본 직접 수정 방지)
    const newState = {
      ...safeData,
      [sourceDay]: [...safeData[sourceDay]],
      [destDay]: [...safeData[destDay]],
    };

    // 1) 같은 날짜 안에서 이동
    if (sourceDay === destDay) {
      const [moved] = newState[sourceDay].splice(source.index, 1);
      newState[sourceDay].splice(destination.index, 0, moved);
    } 
    else {
      // 2) 다른 날짜로 이동
      const [moved] = newState[sourceDay].splice(source.index, 1);
      newState[destDay].splice(destination.index, 0, moved);
    }

    setItineraryByDay(newState);
  };

  /** ---------------------------------------------------------
   *  🔥 3) 렌더링
   * --------------------------------------------------------- */
  const dayKeys = ["day1", "day2", "day3"];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="itinerary-wrapper">

        {dayKeys.map((dayKey, dayIndex) => (
          <Droppable droppableId={dayKey} key={dayKey}>
            {(provided) => (
              <div
                className="day-box"
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                  borderLeft: `6px solid ${DAY_COLORS[dayIndex]}`,
                }}
              >
                <h3>Day {dayIndex + 1}</h3>

                {safeData[dayKey].map((place, index) => (
                  <Draggable
                    key={place.id}
                    draggableId={String(place.id)}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        className={`place-item ${snapshot.isDragging ? "dragging" : ""}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {index + 1}. {place.name}

                        <button
                          className="delete-btn"
                          onClick={() => removeFromItinerary(place.id)}
                        >
                          ❌
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}

      </div>
    </DragDropContext>
  );
};

export default ItineraryListOptimized;
