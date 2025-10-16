import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import PageNotFound from './pages/404page';
import RestaurantDetails from './pages/RestaurantDetails';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}