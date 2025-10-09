import React from 'react'
import Navbar from './components/navbar'
import Footer from './components/footer'
import '../pages/components/css/aboutus.css'


export default function AboutUs() {
  return (
    <>
    <Navbar />

    <section className="about-section container">
                <h1 className="section-title gradient-title">About QuickBite</h1>
                <p className="subtitle">Your favorite restaurants, delivered to your doorstep</p>
                <div className="story-container">
                    <h2 className="section-subtitle">Our Story</h2>
                    <p>QuickBite was founded with a simple mission: to connect food lovers with their favorite local restaurants. We believe that great food should be accessible to everyone—whether you're craving pizza on a relaxing night or need a quick lunch during a busy workday.</p>
                    <p>What started as a small project has grown into a platform that serves thousands of customers daily. We’re proud to work with the best restaurants in town, bringing you diverse cuisines and exceptional dining experiences right to your door.</p>
                    <p>Our commitment is to provide fast, reliable service while supporting local businesses. Every order you place helps restaurants thrive and communities grow stronger.</p>
                </div>
            </section>

            <section className="why-choose-section container">
                <h2 className="section-title">Why Choose QuickBite</h2>
                <div className="benefits">
                    <div className="benefit-card">
                        <div className="benefit-icon">⏱️</div>
                        <h3>Fast Delivery</h3>
                        <p>Get your food delivered hot and fresh in 30-45 minutes</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">🔒</div>
                        <h3>Safe & Secure</h3>
                        <p>Your payment information is protected with industry-leading security</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">🍽️</div>
                        <h3>Quality Food</h3>
                        <p>We partner with the best restaurants to bring you delicious meals</p>
                    </div>
                    <div className="benefit-card">
                        <div className="benefit-icon">📦</div>
                        <h3>Real-time Tracking</h3>
                        <p>Track orders so you always know where your food is</p>
                    </div>
                </div>
                <div className="stats-container">
                    <div className="stat-item">
                        <span className="stat-number">50+</span>
                        <span className="stat-text">Partner Restaurants</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10k+</span>
                        <span className="stat-text">Happy Customers</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">4.8</span>
                        <span className="stat-text">Average Rating</span>
                    </div>
                </div>
            </section>

    <Footer />
    </>
  )
}
