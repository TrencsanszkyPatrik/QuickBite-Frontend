import React from 'react'
import Footer from '../components/Footer'
import '../styles/aboutus.css'
import Navbar from '../components/Navbar';
import { usePageTitle } from '../utils/usePageTitle';

export default function AboutUs() {
  usePageTitle("QuickBite - Rólunk");
  return (
    <>

    <Navbar />
    
    <section className="about-section container">
        <h1 className="section-title gradient-title">A QuickBite-ról</h1>
        <p className="subtitle">Kedvenc éttermeid, házhoz szállítva</p>
        <div className="story-container">
            <h2 className="section-subtitle">Történetünk</h2>
            <p>A QuickBite-ot azzal az egyszerű céllal alapítottuk, hogy összekössük az ínyenceket a kedvenc helyi éttermeikkel. Hiszünk abban, hogy a finom ételek mindenkinek elérhetőek kell legyenek – akár egy nyugodt estén pizzára vágysz, akár egy gyors ebédre a rohanó munkanap közben.</p>
            <p>Ami egy kis projektként indult, mára olyan platformmá nőtte ki magát, amely naponta több ezer vásárlót szolgál ki. Büszkék vagyunk rá, hogy a város legjobb éttermeivel dolgozunk együtt, így változatos konyhákat és kiváló gasztronómiai élményeket juttatunk el közvetlenül az ajtódhoz.</p>
            <p>Elkötelezettek vagyunk a gyors, megbízható szolgáltatás mellett, miközben támogatjuk a helyi vállalkozásokat. Minden rendeléseddel segíted az éttermeket a fejlődésben, és erősíted a közösséget.</p>
        </div>
    </section>

    <section className="why-choose-section container">
        <h2 className="section-title">Miért válaszd a QuickBite-ot?</h2>
        <div className="benefits">
            <div className="benefit-card">
                <div className="benefit-icon">⏱️</div>
                <h3>Villámgyors kiszállítás</h3>
                <p>Forrón és frissen, 30-45 percen belül megkapod az ételedet</p>
            </div>
            <div className="benefit-card">
                <div className="benefit-icon">🔒</div>
                <h3>Biztonságos és védett</h3>
                <p>Fizetési adataidat iparági szintű biztonság védi</p>
            </div>
            <div className="benefit-card">
                <div className="benefit-icon">🍽️</div>
                <h3>Minőségi ételek</h3>
                <p>A legjobb éttermekkel dolgozunk együtt, hogy finom fogásokat kapj</p>
            </div>
            <div className="benefit-card">
                <div className="benefit-icon">📦</div>
                <h3>Valós idejű követés</h3>
                <p>Rendelésedet élőben követheted, így mindig tudod, merre jár az étel</p>
            </div>
        </div>
        <div className="stats-container">
            <div className="stat-item">
                <span className="stat-number">50+</span>
                <span className="stat-text">Partner étterem</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">10 000+</span>
                <span className="stat-text">Elégedett vásárló</span>
            </div>
            <div className="stat-item">
                <span className="stat-number">4,8</span>
                <span className="stat-text">Átlagos értékelés</span>
            </div>
        </div>
    </section>
    <Footer />
    </>
  )
}