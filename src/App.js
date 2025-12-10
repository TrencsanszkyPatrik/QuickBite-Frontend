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
import Opinions from "./pages/Opinions";




export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/rolunk" element={<AboutUs />} />
        <Route path="/aszf" element={<Aszf />} />
        <Route path="/kapcsolat" element={<Contact />} />
        <Route path="/ettermek" element={<AllRestaurantPage />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/kosar" element={<Cart/>}></Route>
        <Route path="/bejelentkezes" element={<Login/>}></Route>
        <Route path="/regisztracio" element={<Register/>}></Route>
        <Route path="/velemenyek" element={<Opinions/>}></Route>
        
        
      </Routes>
    </Router>
  );
}

