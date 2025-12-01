import React from 'react';
import './TabButton.css';

const TabButton = ({ isActive, onClick, children }) => {
  return (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default TabButton;
