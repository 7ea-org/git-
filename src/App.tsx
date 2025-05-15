import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GitPusher from './components/GitPusher/GitPusher';
import Landing from './pages/Landing';
import Documentation from './pages/docs';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <Router>
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<GitPusher />} />
        <Route path="/docs" element={<Documentation />} />
      </Routes>
    </Router>
  );
}

export default App;