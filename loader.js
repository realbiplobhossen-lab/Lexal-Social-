import React from 'react';

function Loader({ msg }) {
  return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <p>{msg}</p>
    </div>
  );
}
export default Loader;

