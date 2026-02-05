import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ScrollToTop from './components/ScrollToTop'
import CookieBanner from './components/CookieBanner'
import HomePage from './pages/HomePage'
import AboutUs from './pages/AboutUs'
import PageNotFound from './pages/404page'
import AllRestaurantPage from './pages/AllRestaurantPage'
import RestaurantDetails from './pages/RestaurantDetails'
import Aszf from './pages/footerpages/Aszf'
import Contact from './pages/footerpages/Contact'
import Cart from './pages/Cart'
import Login from './pages/Login'
import Opinions from './pages/Opinions'
import FavoritesPage from './pages/FavoritesPage'
import Profile from './pages/Profile'
import OrdersPage from './pages/OrdersPage'
import OrderDetailsPage from './pages/OrderDetailsPage'
import DataProtection from './pages/footerpages/DataProtection'
import Cookies from './pages/footerpages/Cookies'
import { API_BASE } from './utils/api'

export default function App() {
  const [opinions, setOpinions] = useState([])
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const response = await fetch(`${API_BASE}/quickbite_reviews`)
        if (!response.ok) {
          throw new Error(`Failed to load opinions: ${response.status}`)
        }

        const text = await response.text()
        if (!text) {
          setOpinions([])
          return
        }

        const data = JSON.parse(text)
        setOpinions(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Hiba a vélemények betöltésekor:', err)
        setOpinions([])
      }
    }
    fetchOpinions()
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('quickbite_favorites')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      }
    } catch (err) {
      console.error('Nem sikerült beolvasni a kedvenceket:', err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('quickbite_favorites', JSON.stringify(favorites))
    } catch (err) {
      console.error('Nem sikerült menteni a kedvenceket:', err)
    }
  }, [favorites])

  const handleToggleFavorite = (restaurant) => {
    if (!restaurant || !restaurant.id) return
    const id = String(restaurant.id)
    setFavorites((prev) => {
      const exists = prev.find((r) => r.id === id)
      if (exists) {
        return prev.filter((r) => r.id !== id)
      }
      const simplified = {
        id,
        name: restaurant.name,
        address: restaurant.address,
        img: restaurant.img
      }
      return [...prev, simplified]
    })
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              opinions={opinions}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route path="/rolunk" element={<AboutUs />} />
        <Route path="/aszf" element={<Aszf />} />
        <Route path="/kapcsolat" element={<Contact />} />
        <Route path="/sütik" element={<Cookies />} />
        <Route
          path="/ettermek"
          element={
            <AllRestaurantPage
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/restaurant/:id"
          element={
            <RestaurantDetails
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route
          path="/kedvencek"
          element={
            <FavoritesPage
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          }
        />
        <Route path="*" element={<PageNotFound />} />
        <Route path="/kosar" element={<Cart />} />
        <Route path="/rendelesek" element={<OrdersPage />} />
        <Route path="/rendelesek/:id" element={<OrderDetailsPage />} />
        <Route path="/bejelentkezes" element={<Login />} />
        <Route path="/velemenyek" element={<Opinions />} />
        <Route path="/profilom" element={<Profile />} />
        <Route path="/adatvedelem" element={<DataProtection />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <CookieBanner />
    </Router>
  )
}