import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './pages/homepage';
import AboutUs from './pages/aboutus';
import PageNotFound from './pages/404page';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}