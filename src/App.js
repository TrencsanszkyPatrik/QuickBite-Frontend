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
import { API_BASE, getAuthHeaders } from './utils/api'
import { showToast } from './utils/toast'

export default function App() {
  const [opinions, setOpinions] = useState([])
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    const fetchOpinions = async () => {
      try {
        const response = await fetch(`${API_BASE}/QuickbiteReviews`)
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

  const mapFavorite = (r) => ({
    id: String(r.id),
    name: r.name,
    address: `${r.city}, ${r.address}`,
    img: r.imageUrl || r.image_url,
    freeDelivery: r.freeDelivery ?? r.free_delivery,
    acceptCards: r.acceptCards ?? r.accept_cards,
    cuisine_id: r.cuisineId ?? r.cuisine_id,
    discount: r.discount ?? 0
  })

  const loadFavorites = async () => {
    const token = localStorage.getItem('quickbite_token')
    if (!token) {
      setFavorites([])
      return
    }
    try {
      const res = await fetch(`${API_BASE}/Favorites`, { headers: getAuthHeaders() })
      if (!res.ok) {
        throw new Error(`Failed to load favorites: ${res.status}`)
      }
      const data = await res.json()
      const mapped = Array.isArray(data) ? data.map(mapFavorite) : []
      setFavorites(mapped)
    } catch (err) {
      console.error('Nem sikerult betolteni a kedvenceket:', err)
      setFavorites([])
    }
  }

  useEffect(() => {
    loadFavorites()

    const handleLogin = () => loadFavorites()
    const handleLogout = () => setFavorites([])

    window.addEventListener('userLoggedIn', handleLogin)
    window.addEventListener('userLoggedOut', handleLogout)

    return () => {
      window.removeEventListener('userLoggedIn', handleLogin)
      window.removeEventListener('userLoggedOut', handleLogout)
    }
  }, [])

  const handleToggleFavorite = async (restaurant) => {
    if (!restaurant || !restaurant.id) return
    const token = localStorage.getItem('quickbite_token')
    if (!token) {
      showToast.error('Kedvencekhez bejelentkezes szukseges.')
      return
    }

    const id = String(restaurant.id)
    const exists = favorites.some((r) => String(r.id) === id)

    try {
      if (exists) {
        const res = await fetch(`${API_BASE}/Favorites/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
        if (!res.ok && res.status !== 404) {
          throw new Error(`Failed to remove favorite: ${res.status}`)
        }
        setFavorites((prev) => prev.filter((r) => String(r.id) !== id))
      } else {
        const res = await fetch(`${API_BASE}/Favorites`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ restaurantId: Number(id) })
        })
        if (!res.ok) {
          throw new Error(`Failed to add favorite: ${res.status}`)
        }
        const data = await res.json().catch(() => null)
        const next = data ? mapFavorite(data) : {
          id,
          name: restaurant.name,
          address: restaurant.address,
          img: restaurant.img
        }
        setFavorites((prev) => [...prev, next])
      }
    } catch (err) {
      console.error('Kedvenc frissites sikertelen:', err)
      showToast.error('Kedvenc frissitese sikertelen.')
    }
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
        <Route path="/profilom" element={<Profile favorites={favorites} />} />
        <Route path="/adatvedelem" element={<DataProtection />} />
      </Routes>
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ top: '150px' }}
      />
      <CookieBanner />
    </Router>
  )
}