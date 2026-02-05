import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import '../../styles/aszf.css'
import { usePageTitle } from '../../utils/usePageTitle'

export default function Cookies() {
    usePageTitle("QuickBite - Sütik kezelése");
    return (
        <>
            <Navbar />
            <div className="container-aszf">
                <h1 className="h1-aszf">Sütik (Cookie-k) kezelési tájékoztató</h1>
                <p className="p-aszf">
                    <strong className="strong-aszf">QuickBite online ételrendelő platform</strong>
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">Hatályos: 2025. január 1-től</strong>
                </p>

                <h2 className="h2-aszf">1. Mi az a süti?</h2>
                <p className="p-aszf">
                    A süti (cookie) egy kis adatfájl, amelyet a böngésződ ment el, hogy felismerjük a látogatásod,
                    megjegyezzük a beállításaidat, és javítsuk az oldal működését.
                </p>

                <h2 className="h2-aszf">2. Milyen sütiket használunk?</h2>
                <p className="p-aszf"><strong className="strong-aszf">2.1. Működéshez szükséges sütik</strong> - ezek biztosítják a bejelentkezést, a kosár működését és az oldal alapfunkcióit.</p>
                <p className="p-aszf"><strong className="strong-aszf">2.2. Funkcionális sütik</strong> - megjegyzik a választott nyelvet, címeket, korábbi kereséseket a kényelmesebb használathoz.</p>
                <p className="p-aszf"><strong className="strong-aszf">2.3. Analitikai sütik</strong> - anonim módon mérik, hogyan használod az oldalt (pl. Google Analytics), hogy fejleszteni tudjuk a szolgáltatást.</p>
                <p className="p-aszf"><strong className="strong-aszf">2.4. Marketing sütik</strong> - csak hozzájárulás után, hogy releváns ajánlatokat jeleníthessünk meg. Jelenleg alapértelmezetten nem használjuk.</p>

                <h2 className="h2-aszf">3. Mire használjuk a sütiket?</h2>
                <p className="p-aszf"><strong className="strong-aszf">3.1.</strong> Folyamatos bejelentkezés és rendelés véglegesítése.</p>
                <p className="p-aszf"><strong className="strong-aszf">3.2.</strong> Teljesítmény figyelése, hibák feltárása, oldaloptimalizálás.</p>
                <p className="p-aszf"><strong className="strong-aszf">3.3.</strong> Kényelmi funkciók (cím mentése, kedvencek kezelése).</p>

                <h2 className="h2-aszf">4. Meddig tároljuk a sütiket?</h2>
                <p className="p-aszf"><strong className="strong-aszf">4.1.</strong> Munkamenet sütik: a böngésző bezárásáig élnek.</p>
                <p className="p-aszf"><strong className="strong-aszf">4.2.</strong> Tartós sütik: jellemzően 6-12 hónapig maradnak, vagy amíg nem törlöd őket.</p>

                <h2 className="h2-aszf">5. Hogyan tudod kezelni vagy tiltani a sütiket?</h2>
                <p className="p-aszf"><strong className="strong-aszf">5.1.</strong> A legtöbb böngészőben a beállításoknál törölheted, letilthatod vagy korlátozhatod a sütiket.</p>
                <p className="p-aszf"><strong className="strong-aszf">5.2.</strong> A szükséges sütik tiltása a bejelentkezés és a rendelés működését akadályozhatja.</p>
                <p className="p-aszf"><strong className="strong-aszf">5.3.</strong> A hozzájáruláson alapuló sütiket bármikor visszavonhatod a böngésződ beállításaiban vagy a cookie sávon keresztül.</p>

                <h2 className="h2-aszf">6. Harmadik felek sütijei</h2>
                <p className="p-aszf"><strong className="strong-aszf">6.1.</strong> Analitikai partnerek (pl. Google Analytics) sütijei anonim statisztikát gyűjtenek.</p>
                <p className="p-aszf"><strong className="strong-aszf">6.2.</strong> Marketing célú sütiket csak külön hozzájárulással helyezünk el.</p>

                <h2 className="h2-aszf">7. Hozzájárulás és visszavonás</h2>
                <p className="p-aszf"><strong className="strong-aszf">7.1.</strong> Az oldal első használatakor a cookie sávon keresztül adhatsz hozzájárulást.</p>
                <p className="p-aszf"><strong className="strong-aszf">7.2.</strong> A hozzájárulást bármikor visszavonhatod a böngésződ beállításaiban vagy a cookie sáv újbóli megnyitásával.</p>

                <h2 className="h2-aszf">8. Kapcsolat</h2>
                <p className="p-aszf">
                    Ha kérdésed van a sütik használatával kapcsolatban, írj nekünk:
                </p>
                <p className="p-list-aszf">- E-mail: info@quickbite.hu</p>

                <p className="p-aszf">
                    <em className="em-aszf">
                        Jelen tájékoztatót időről időre frissíthetjük. A módosításokat a weboldalon tesszük közzé.
                    </em>
                </p>
            </div>
            <Footer />
        </>
    )
}
