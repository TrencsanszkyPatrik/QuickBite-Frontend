import React from 'react'
import '../styles/homepage.css'

export default function Benefits() {
  return (
    <div className="container">
      <h2 className="section-title">Miért válasszon minket?</h2>
      <div className="benefits-home">
        <div className="benefit-card-home">
          <div className="benefit-icon-home">⭐</div>
          <h3>Legjobb éttermek</h3>
          <p>Csak ellenőrzött, magas minőségű éttermekkel dolgozunk. Minden vendéglátóhely megfelel a legszigorúbb követelményeknek.</p>
        </div>
        <div className="benefit-card-home">
          <div className="benefit-icon-home">⚡</div>
          <h3>Villámgyors szállítás</h3>
          <p>30 percen belül kiszállítjuk az ételedet. Valós idejű követéssel mindig tudod, hol jár a futár.</p>
        </div>
        <div className="benefit-card-home">
          <div className="benefit-icon-home">💳</div>
          <h3>Biztonságos fizetés</h3>
          <p>Fizetés készpénzzel, bankkártyával vagy online. Minden tranzakció biztonságos és védett.</p>
        </div>
      </div>
    </div>
  )
}
