import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUs";
import PageNotFound from "./pages/404page";
import AllRestaurantPage from "./pages/AllRestaurantPage";
import RestaurantDetails from "./pages/RestaurantDetails";
import Aszf from "./pages/footerpages/Aszf";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/aszf" element={<Aszf />} />
        <Route path="/restaurants" element={<AllRestaurantPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
}
