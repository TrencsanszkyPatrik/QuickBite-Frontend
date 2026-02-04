import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import '../styles/OrdersPage.css'

export default function OrdersPage() {
  usePageTitle('QuickBite - Rendeléseim')
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    if (!token) {
      setIsLoggedIn(false)
      setIsLoading(false)
      return
    }

    setIsLoggedIn(true)
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_BASE}/Orders`, { headers: getAuthHeaders() })
        setOrders(res.data || [])
      } catch (err) {
        if (err.response?.status === 401) {
          setIsLoggedIn(false)
        }
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Feldolgozás alatt',
      confirmed: 'Megerősítve',
      preparing: 'Elkészül',
      delivering: 'Kiszállítás alatt',
      delivered: 'Kiszállítva',
      cancelled: 'Törölve'
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      delivering: 'status-delivering',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    }
    return classes[status] || ''
  }

  if (!isLoggedIn && !isLoading) {
    return (
      <>
        <Navbar />
        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-login-required">
              <div className="orders-login-icon">🔐</div>
              <h2>Bejelentkezés szükséges</h2>
              <p>A rendeléseid megtekintéséhez jelentkezz be!</p>
              <button
                className="orders-login-btn"
                onClick={() => navigate('/bejelentkezes')}
              >
                Bejelentkezés
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">Rendeléseim</h1>

          {isLoading ? (
            <div className="orders-loading">
              <div className="orders-spinner"></div>
              <p>Rendelések betöltése...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="orders-empty">
              <div className="orders-empty-icon">📋</div>
              <h2>Még nincs rendelésed</h2>
              <p>Rendelj valamit és itt fogod látni a rendeléseidet!</p>
              <button
                className="orders-browse-btn"
                onClick={() => navigate('/ettermek')}
              >
                Éttermeink böngészése
              </button>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="orders-card"
                  onClick={() => navigate(`/rendelesek/${order.id}`)}
                >
                  <div className="orders-card-header">
                    <span className={`orders-status ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="orders-date">
                      {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className="orders-restaurant">{order.restaurantName}</h3>
                  <p className="orders-summary">
                    {order.itemCount} tétel · {order.total.toLocaleString()} Ft
                  </p>
                  <div className="orders-card-arrow">
                    <i className="bi bi-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
