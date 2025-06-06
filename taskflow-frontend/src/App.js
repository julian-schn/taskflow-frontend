import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Completed from './pages/Completed';
import { TaskProvider} from './context/TaskContext'

function App() {
  return (
    <TaskProvider>
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/completed" element={<Completed />} />
        </Routes>
      </div>
    </Router>
    </TaskProvider>
  );
}

export default App;
