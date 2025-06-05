
import React from 'react';
import { Link } from 'react-router-dom';
import './Completed.css'; 
import { NavLink } from 'react-router-dom';

function Completed() {
  return (
    <div className="completed">
      <h1>taskflow.</h1>
      <h2>Completed Tasks:</h2>
      <div className="filter-buttons">

              <NavLink
              to="/"
                end
                className={({ isActive }) =>
               `filter-button ${isActive ? 'active' : ''}`
                 }
                   >
                    All
                     </NavLink>
        
                <NavLink
                to="/completed"
                 className={({ isActive }) =>
                `filter-button ${isActive ? 'active' : ''}`
                 }
                 >
                  Completed
                </NavLink>
            </div>
    
    </div>
  );
}

export default Completed;
