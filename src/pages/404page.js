import React from 'react'
import '../pages//components/css/404page.css'

export default function PageNotFound() {
  return (
    <>
    <div className="page404-container"> 
        <h2>404<br/> Az oldal nem található</h2>
        <p>Sajnáljuk, de a keresett oldal nem létezik.<br/>Kérjük, ellenőrizd a címet, vagy térj vissza a főoldalra!</p>
        <a href="/" className="page404-home-link">Vissza a főoldalra</a>
    </div>
    </>
  )
}
