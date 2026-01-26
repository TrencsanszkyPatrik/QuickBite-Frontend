import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../styles/cart.css'
import { usePageTitle } from '../utils/usePageTitle'

export default function Cart() {
  usePageTitle('QuickBite - Kosár')
  return (
    <>
      <Navbar />
      <main>
        <div className="cart-section">
            <h2>Kosár</h2>
            <div className="cart-items">
                <div className="cart-item">
                    <div className="cart-item-image"></div>
                    <div className="cart-item-details">
                        <h3>Mario's Pizzeria</h3>
                        <p>Margherita Pizza</p>
                        <span className="price">$18.99</span>
                    </div>
                    <div className="cart-item-quantity">
                        <button className="quantity-btn">-</button>
                        <input type="number" value="1" min="1" />
                        <button className="quantity-btn">+</button>
                    </div>
                    <span className="cart-item-remove">🗑️</span>
                </div>
                <div className="cart-item">
                    <div className="cart-item-image"></div>
                    <div className="cart-item-details">
                        <h3>Sakura Sushi</h3>
                        <p>California Roll</p>
                        <span className="price">$12.50</span>
                    </div>
                    <div className="cart-item-quantity">
                        <button className="quantity-btn">-</button>
                        <input type="number" value="2" min="1" />
                        <button className="quantity-btn">+</button>
                    </div>
                    <span className="cart-item-remove">🗑️</span>
                </div>
            </div>
            <div className="order-summary">
                <h3>Rendelés Összegzése</h3>
                <p>Subtotal: <span>$43.99</span></p>
                <p>Delivery Fee: <span>$3.99</span></p>
                <p>Tax: <span>$3.52</span></p>
                <p className="total">Total: <span>$51.50</span></p>
                <button className="checkout-btn">Rendelés leadása</button>
            </div>
        </div>
        <div className="checkout-section">
            <h2>Szállítási és Fizetési Adatok</h2>
            <div className="checkout-form">
                <div className="form-group">
                    <label htmlFor="full-name">Teljes Név</label>
                    <input type="text" id="full-name" placeholder="Ének Elek" />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Cím</label>
                    <input type="text" id="address" placeholder="Étterem utca 12" />
                </div>
                <div className="form-group">
                    <label htmlFor="city">Város</label>
                    <input type="text" id="city" placeholder="Senkiháza" />
                </div>
                <div className="form-group">
                    <label htmlFor="zip">Irányítószám</label>
                    <input type="text" id="zip" placeholder="1234" />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Telefonszám</label>
                    <input type="tel" id="phone" placeholder="+36 (123) 456-7890" />
                </div>
                <div className="form-group">
                    <label htmlFor="instructions">Szállítási Utasítások</label>
                    <input type="text" id="instructions" placeholder="Pl.: Hagyja az ajtó előtt" />
                </div>
                <h3>Fizetési Mód</h3>
                <div className="payment-methods">
                    <div className="payment-option">
                        <input type="radio" id="credit-card" name="payment" value="credit-card" />
                        <label htmlFor="credit-card">Hitel-/Debitkártya</label>
                    </div>
                    <div className="payment-option">
                        <input type="radio" id="paypal" name="payment" value="paypal" />
                        <label htmlFor="paypal">PayPal</label>
                    </div>
                    <div className="payment-option">
                        <input type="radio" id="cash" name="payment" value="cash" />
                        <label htmlFor="cash">Fizetés kézbesítéskor</label>
                    </div>
                </div>
                <div className="card-details" id="card-details">
                    <div className="form-group">
                        <label htmlFor="card-number">Kártyaszám</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="expiry">Lejárati Dátum</label>
                        <input type="text" id="expiry" placeholder="MM/YY" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input type="text" id="cvv" placeholder="123" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="card-name">Név a kártyán</label>
                        <input type="text" id="card-name" placeholder="DeMilyen Áron" />
                    </div>
                </div>
            </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
