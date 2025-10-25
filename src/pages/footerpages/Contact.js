import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../components/css/contact.css'

export default function Contact() {
    return (
        <>
            <Navbar />
            <div className="container-contact">
                <h1 className="h1-contact">Kapcsolat</h1>
                <form className="form-contact">
                    <input type="text" placeholder="Név" className="input-contact" />
                    <input type="email" placeholder="Email" className="input-contact" />
                    <textarea placeholder="Üzenet" className="textarea-contact" />
                    <button type="submit" className="button-contact">Küldés</button>
                </form>
            </div>
            <Footer />
        </>
    )
}