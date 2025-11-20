import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AboutUs from "./pages/AboutUs";
import PageNotFound from "./pages/404page";
import AllRestaurantPage from "./pages/AllRestaurantPage";
import RestaurantDetails from "./pages/RestaurantDetails";
import Aszf from "./pages/footerpages/Aszf";
import Contact from "./pages/footerpages/Contact";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/aszf" element={<Aszf />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/restaurants" element={<AllRestaurantPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/cart" element={<Cart/>}></Route>
        <Route path="/login" element={<Login/>}></Route>
        <Route path="/register" element={<Register/>}></Route>
      </Routes>
    </Router>
  );
}

