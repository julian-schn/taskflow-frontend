import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Completed from './pages/Completed';
import { TaskProvider} from './context/TaskContext'
import { ThemeProvider } from './pages/ThemeContext';

function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
