import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import SpinnerOverlay from '../components/SpinnerOverlay'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import '../styles/OrdersPage.css'
import '../styles/modal.css'

const parseApiDateTime = (value) => {
  if (!value) return null
  if (value instanceof Date) return value

  const str = String(value)
  const hasTimezone = /([zZ]|[+-]\d{2}:?\d{2})$/.test(str)
  const normalized = hasTimezone ? str : `${str}Z`

  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) {
    return new Date(str)
  }
  return parsed
}

export default function OrdersPage() {
  usePageTitle('QuickBite - Rendeléseim')
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const canCancelOrder = (status) => status === 'pending'

  const openCancelModal = (order, e) => {
    e.stopPropagation()
    setOrderToCancel(order)
    setIsCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    if (isCancelling) return
    setIsCancelModalOpen(false)
    setOrderToCancel(null)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return

    try {
      setIsCancelling(true)
      const res = await axios.post(
        `${API_BASE}/Orders/${orderToCancel.id}/cancel`,
        {},
        { headers: getAuthHeaders() }
      )

      const updatedOrder = res.data
      setOrders((prev) => prev.map((order) => (
        order.id === updatedOrder.id
          ? { ...order, status: updatedOrder.status }
          : order
      )))

      showToast.success('A rendelés lemondva.')
      setIsCancelModalOpen(false)
      setOrderToCancel(null)
    } catch (err) {
      const message = err.response?.data?.message || 'Nem sikerült lemondani a rendelést.'
      showToast.error(message)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleReorder = async (orderId, e) => {
    e.stopPropagation() 
    
    try {
      const res = await axios.get(`${API_BASE}/Orders/${orderId}`, {
        headers: getAuthHeaders()
      })
      const order = res.data

      if (!order || !order.items) {
        showToast.error('Nem sikerült betölteni a rendelést')
        return
      }
      const cartItems = order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        img: item.imageUrl || '/img/EtelKepek/default.png',
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        restaurantFreeDelivery: false
      }))

      localStorage.setItem('quickbite_cart', JSON.stringify(cartItems))
      window.dispatchEvent(new Event('cartUpdated'))
      
      showToast.success('Rendelés betöltve a kosárba! 🛒')
      
      setTimeout(() => {
        navigate('/kosar')
      }, 1000)
    } catch (err) {
      console.error('Újrarendelés hiba:', err)
      showToast.error('Nem sikerült újrarendelni')
    }
  }

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
      cancelled: 'Lemondva'
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
      {isLoading && <SpinnerOverlay label="Rendelések betöltése..." />}
      <main className="orders-page">
        <div className="orders-container">
          <h1 className="orders-title">Rendeléseim</h1>

          {!isLoading && orders.length === 0 ? (
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
          ) : !isLoading ? (
            <div className="orders-list">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="orders-card"
                >
                  <div 
                    className="orders-card-clickable"
                    onClick={() => navigate(`/rendelesek/${order.id}`)}
                  >
                    <div className="orders-card-header">
                      <span className={`orders-status ${getStatusClass(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="orders-date">
                        {parseApiDateTime(order.createdAt)?.toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) || ''}
                      </span>
                    </div>
                    <h3 className="orders-restaurant">{order.restaurantName}</h3>
                    <p className="orders-summary">
                      {order.itemCount} tétel · {order.total.toLocaleString()} Ft
                    </p>
                  </div>
                  <div className="orders-card-actions">
                    <button
                      className="orders-reorder-btn"
                      onClick={(e) => handleReorder(order.id, e)}
                    >
                      <i className="bi bi-arrow-clockwise"></i> Újrarendelés
                    </button>
                    <button 
                      className="orders-details-btn"
                      onClick={() => navigate(`/rendelesek/${order.id}`)}
                    >
                      Részletek <i className="bi bi-chevron-right"></i>
                    </button>
                    <button
                      className={`orders-cancel-btn ${!canCancelOrder(order.status) ? 'orders-cancel-btn-disabled' : ''}`}
                      onClick={(e) => openCancelModal(order, e)}
                      disabled={!canCancelOrder(order.status)}
                    >
                      <i className="bi bi-x-circle"></i> Lemondás
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </main>
      {isCancelModalOpen && orderToCancel && (
        <div className="modal-overlay" onClick={closeCancelModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rendelés lemondása</h2>
              <button className="modal-close" onClick={closeCancelModal} aria-label="Bezárás">
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-text">
                Biztosan lemondod ezt a rendelést?
              </p>
              <p className="modal-text">
                <strong>{orderToCancel.restaurantName}</strong>
              </p>
              <p className="modal-text">
                A művelet után a rendelés állapota <strong>Lemondva</strong> lesz.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={closeCancelModal}
                disabled={isCancelling}
              >
                Mégse
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={confirmCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? 'Lemondás...' : 'Igen, lemondom'}
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}
