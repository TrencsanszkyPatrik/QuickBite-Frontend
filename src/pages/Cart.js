import React from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import "../pages/components/css/cart.css"

export default function kosar() {
  return (
    <>
    
    <Navbar/>
    <main>
        <div class="cart-section">
            <h2>Kosár</h2>
            <div class="cart-items">
                <div class="cart-item">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-details">
                        <h3>Mario's Pizzeria</h3>
                        <p>Margherita Pizza</p>
                        <span class="price">$18.99</span>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn">-</button>
                        <input type="number" value="1" min="1" />
                        <button class="quantity-btn">+</button>
                    </div>
                    <span class="cart-item-remove">🗑️</span>
                </div>
                <div class="cart-item">
                    <div class="cart-item-image"></div>
                    <div class="cart-item-details">
                        <h3>Sakura Sushi</h3>
                        <p>California Roll</p>
                        <span class="price">$12.50</span>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn">-</button>
                        <input type="number" value="2" min="1" />
                        <button class="quantity-btn">+</button>
                    </div>
                    <span class="cart-item-remove">🗑️</span>
                </div>
            </div>
            <div class="order-summary">
                <h3>Rendelés Összegzése</h3>
                <p>Subtotal: <span>$43.99</span></p>
                <p>Delivery Fee: <span>$3.99</span></p>
                <p>Tax: <span>$3.52</span></p>
                <p class="total">Total: <span>$51.50</span></p>
                <button class="checkout-btn">Rendelés leadása</button>
            </div>
        </div>
        <div class="checkout-section">
            <h2>Szállítási és Fizetési Adatok</h2>
            <div class="checkout-form">
                <div class="form-group">
                    <label for="full-name">Teljes Név</label>
                    <input type="text" id="full-name" placeholder="Ének Elek" />
                </div>
                <div class="form-group">
                    <label for="address">Cím</label>
                    <input type="text" id="address" placeholder="Étterem utca 12" />
                </div>
                <div class="form-group">
                    <label for="city">Város</label>
                    <input type="text" id="city" placeholder="Senkiháza" />
                </div>
                <div class="form-group">
                    <label for="zip">Irányítószám</label>
                    <input type="text" id="zip" placeholder="1234" />
                </div>
                <div class="form-group">
                    <label for="phone">Telefonszám</label>
                    <input type="tel" id="phone" placeholder="+36 (123) 456-7890" />
                </div>
                <div class="form-group">
                    <label for="instructions">Szállítási Utasítások</label>
                    <input type="text" id="instructions" placeholder="Pl.: Hagyja az ajtó előtt" />
                </div>
                <h3>Fizetési Mód</h3>
                <div class="payment-methods">
                    <div class="payment-option">
                        <input type="radio" id="credit-card" name="payment" value="credit-card" onclick="showCardDetails(true)" />
                        <label for="credit-card">Hitel-/Debitkártya</label>
                    </div>
                    <div class="payment-option">
                        <input type="radio" id="paypal" name="payment" value="paypal" onclick="showCardDetails(false)" />
                        <label for="paypal">PayPal</label>
                    </div>
                    <div class="payment-option">
                        <input type="radio" id="cash" name="payment" value="cash" onclick="showCardDetails(false)" />
                        <label for="cash">Fizetés kézbesítéskor</label>
                    </div>
                </div>
                <div class="card-details" id="card-details">
                    <div class="form-group">
                        <label for="card-number">Kártyaszám</label>
                        <input type="text" id="card-number" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div class="form-group">
                        <label for="expiry">Lejárati Dátum</label>
                        <input type="text" id="expiry" placeholder="MM/YY" />
                    </div>
                    <div class="form-group">
                        <label for="cvv">CVV</label>
                        <input type="text" id="cvv" placeholder="123" />
                    </div>
                    <div class="form-group">
                        <label for="card-name">Név a kártyán</label>
                        <input type="text" id="card-name" placeholder="DeMilyen Áron" />
                    </div>
                </div>
            </div>
        </div>
    </main>
    <Footer/>
    </>
  )
}
