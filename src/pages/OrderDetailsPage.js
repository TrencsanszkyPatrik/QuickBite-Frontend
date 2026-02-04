import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import '../styles/OrdersPage.css'

export default function OrderDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  usePageTitle('QuickBite - Rendelés részletei')

  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    if (!token) {
      navigate('/bejelentkezes')
      return
    }

    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_BASE}/Orders/${id}`, {
          headers: getAuthHeaders()
        })
        setOrder(res.data)
        setError(null)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('A rendelés nem található.')
        } else if (err.response?.status === 401) {
          navigate('/bejelentkezes')
        } else {
          setError('Hiba történt a rendelés betöltésekor.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [id, navigate])

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

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="orders-page">
          <div className="orders-container">
            <div className="orders-loading">
              <div className="orders-spinner"></div>
              <p>Rendelés betöltése...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !order) {
    return (
      <>
        <Navbar />
        <main className="orders-page">
          <div className="orders-container">
            <div className="order-detail-error">
              <p>{error || 'Ismeretlen hiba'}</p>
              <button
                className="orders-back-btn"
                onClick={() => navigate('/rendelesek')}
              >
                Vissza a rendelésekhez
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
          <button
            className="orders-back-btn orders-back-btn-top"
            onClick={() => navigate('/rendelesek')}
          >
            <i className="bi bi-arrow-left"></i> Vissza
          </button>

          <div className="order-detail">
            <div className="order-detail-header">
              <div>
                <h1 className="order-detail-title">Rendelés #{order.id}</h1>
                <span className={`orders-status order-detail-status ${getStatusClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <span className="order-detail-date">
                {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div className="order-detail-restaurant">
              <i className="bi bi-shop"></i>
              <h2>{order.restaurantName}</h2>
            </div>

            <div className="order-detail-section">
              <h3>Rendelt ételek</h3>
              <div className="order-detail-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-detail-item">
                    <img
                      src={item.imageUrl || '/img/EtelKepek/default.png'}
                      alt={item.name}
                    />
                    <div className="order-detail-item-info">
                      <span className="order-detail-item-name">{item.name}</span>
                      <span className="order-detail-item-qty">
                        {item.quantity}x {item.price.toLocaleString()} Ft
                      </span>
                    </div>
                    <span className="order-detail-item-total">
                      {(item.price * item.quantity).toLocaleString()} Ft
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-detail-section">
              <h3>Szállítási cím</h3>
              <div className="order-detail-address">
                <p><strong>{order.delivery.fullName}</strong></p>
                <p>{order.delivery.address}</p>
                <p>{order.delivery.zip} {order.delivery.city}</p>
                <p>{order.delivery.phone}</p>
                {order.delivery.instructions && (
                  <p className="order-detail-instructions">
                    Megjegyzés: {order.delivery.instructions}
                  </p>
                )}
              </div>
            </div>

            <div className="order-detail-section">
              <h3>Fizetés</h3>
              <p className="order-detail-payment">{order.paymentMethod}</p>
            </div>

            <div className="order-detail-summary">
              <div className="order-detail-summary-row">
                <span>Részösszeg:</span>
                <span>{order.subtotal.toLocaleString()} Ft</span>
              </div>
              <div className="order-detail-summary-row">
                <span>Szállítási díj:</span>
                <span>
                  {order.deliveryFee === 0
                    ? 'Ingyenes'
                    : `${order.deliveryFee.toLocaleString()} Ft`}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="order-detail-summary-row discount">
                  <span>Kedvezmény{order.couponCode ? ` (${order.couponCode})` : ''}:</span>
                  <span>-{order.discount.toLocaleString()} Ft</span>
                </div>
              )}
              <div className="order-detail-summary-row total">
                <span>Összesen:</span>
                <span>{order.total.toLocaleString()} Ft</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
