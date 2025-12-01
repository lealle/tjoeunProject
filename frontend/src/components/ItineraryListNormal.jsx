// ItineraryListNormal.jsx
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const ItineraryListNormal = ({ list, handleOnDragEnd, removeFromItinerary }) => {
  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="normal-list">
        {(provided) => (
          <div
            className="normal-list-box"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {list.map((place, index) => (
              <Draggable key={place.id} draggableId={String(place.id)} index={index}>
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
    </DragDropContext>
  );
};

export default ItineraryListNormal;
