
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Falls du das Styling wiederverwenden willst

function Completed() {
  return (
    <div className="home">
      <h1>Completed Tasks</h1>
      <p>Hier könnten deine erledigten Tasks angezeigt werden.</p>
      <Link to="/" className="box-button">Zurück</Link>
    </div>
  );
}

export default Completed;
