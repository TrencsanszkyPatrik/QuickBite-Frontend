import React from 'react'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'
import '../../styles/aszf.css'
import { usePageTitle } from '../../utils/usePageTitle';

export default function DataProtection() {
    usePageTitle("QuickBite - Adatvédelem");
    return (
        <>
            <Navbar />
            <div className="container-aszf">
                <h1 className="h1-aszf">Adatvédelmi tájékoztató</h1>
                <p className="p-aszf">
                    <strong className="strong-aszf">QuickBite online ételrendelő platform</strong>
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">Hatályos: 2025. január 1-től</strong>
                </p>

                <h2 className="h2-aszf">1. KI KEZELI A SZEMÉLYES ADATOKAT?</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">1.1.</strong> Az adatkezelő: QuickBite (a továbbiakban: „Szolgáltató”),
                    amely az oldalon keresztül online ételrendelési és étteremkereső szolgáltatást nyújt.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">1.2.</strong> Elérhetőség: info@quickbite.hu
                </p>

                <h2 className="h2-aszf">2. MILYEN ADATOKAT KEZELÜNK?</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">2.1.</strong> A regisztráció és bejelentkezés során:
                </p>
                <p className="p-list-aszf">- név</p>
                <p className="p-list-aszf">- e-mail cím</p>
                <p className="p-list-aszf">- jelszó (titkosított formában)</p>
                <p className="p-aszf">
                    <strong className="strong-aszf">2.2.</strong> Rendeléskor:
                </p>
                <p className="p-list-aszf">- szállítási cím</p>
                <p className="p-list-aszf">- telefonszám (ha megadod)</p>
                <p className="p-list-aszf">- rendelési adatok (rendelt ételek, összeg, időpont)</p>
                <p className="p-aszf">
                    <strong className="strong-aszf">2.3.</strong> A weboldal használata során:
                </p>
                <p className="p-list-aszf">- technikai adatok (IP-cím, böngésző típusa, eszköz típusa)</p>
                <p className="p-list-aszf">- sütik (cookie-k) által gyűjtött információk</p>

                <h2 className="h2-aszf">3. ADATKEZELÉS CÉLJA</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">3.1.</strong> Felhasználói fiók létrehozása és kezelése, bejelentkezés biztosítása.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">3.2.</strong> Rendelések fogadása, továbbítása az éttermek felé és teljesítésük
                    biztosítása.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">3.3.</strong> A szolgáltatás minőségének javítása, hibák feltárása, statisztikák készítése.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">3.4.</strong> Jogszabályi kötelezettségek teljesítése (számlázási, számviteli kötelezettségek).
                </p>

                <h2 className="h2-aszf">4. ADATKEZELÉS JOGALAPJA</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">4.1.</strong> Szerződés teljesítése: amikor rendelést adsz le, az adatok kezelése
                    a szolgáltatás nyújtásához szükséges.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">4.2.</strong> Jogi kötelezettség teljesítése: számlázási adatok megőrzése.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">4.3.</strong> Jogos érdek: a rendszer biztonságának fenntartása, visszaélések
                    megelőzése, alapvető statisztikák készítése.
                </p>

                <h2 className="h2-aszf">5. MEDDIG ŐRIZZÜK MEG AZ ADATOKAT?</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">5.1.</strong> A felhasználói fiók adatait a fiók fennállásáig, illetve annak
                    törléséig kezeljük.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">5.2.</strong> A rendelési és számlázási adatokat a vonatkozó jogszabályok
                    (általában 8 év) alapján kötelesek vagyunk megőrizni.
                </p>

                <h2 className="h2-aszf">6. KINEK ADJUK ÁT AZ ADATAIDAT?</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">6.1.</strong> Az adatokhoz hozzáférhetnek:
                </p>
                <p className="p-list-aszf">- a QuickBite rendszerüzemeltetői és ügyfélszolgálata</p>
                <p className="p-list-aszf">- a kiválasztott étterem (a rendelés teljesítéséhez szükséges adatok)</p>
                <p className="p-list-aszf">- külső IT szolgáltatók (tárhelyszolgáltató, rendszerüzemeltető)</p>
                <p className="p-aszf">
                    <strong className="strong-aszf">6.2.</strong> Az adatokat harmadik félnek marketing célból
                    nem adjuk át a hozzájárulásod nélkül.
                </p>

                <h2 className="h2-aszf">7. MILYEN JOGAID VANNAK?</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.1.</strong> Hozzáférés joga – kérhetsz visszajelzést arról, hogy
                    kezeljük-e a személyes adataidat, és ha igen, milyen adatokat.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.2.</strong> Helyesbítés joga – kérheted a pontatlan adatok javítását,
                    hiányos adatok kiegészítését.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.3.</strong> Törlés joga – bizonyos esetekben kérheted adataid törlését
                    (pl. ha már nincs szükség az adatkezelésre).
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.4.</strong> Adatkezelés korlátozásának joga – kérheted, hogy csak
                    tároljuk, de más módon ne használjuk fel az adataidat.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.5.</strong> Adathordozhatóság – kérheted, hogy az általad megadott
                    adatokat géppel olvasható formában megkapd vagy másik szolgáltatóhoz továbbítsuk.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">7.6.</strong> Panasz benyújtása – ha úgy érzed, megsértettük a
                    személyes adataid védelméhez fűződő jogaidat, panaszt tehetsz a Nemzeti Adatvédelmi és
                    Információszabadság Hatóságnál (NAIH).
                </p>

                <h2 className="h2-aszf">8. SÜTIK (COOKIE-K) HASZNÁLATA</h2>
                <p className="p-aszf">
                    <strong className="strong-aszf">8.1.</strong> A weboldal sütiket használ a bejelentkezés
                    fenntartására, a kosár működéséhez és az oldal működésének javítására.
                </p>
                <p className="p-aszf">
                    <strong className="strong-aszf">8.2.</strong> A legtöbb böngészőben a sütik használata letiltható
                    vagy korlátozható, de ez befolyásolhatja az oldal működését.
                </p>

                <h2 className="h2-aszf">9. KAPCSOLAT</h2>
                <p className="p-aszf">
                    Ha kérdésed van az adatkezeléssel kapcsolatban, vagy jogaidat szeretnéd gyakorolni,
                    az alábbi elérhetőségen tudsz kapcsolatba lépni velünk:
                </p>
                <p className="p-list-aszf">- E-mail: info@quickbite.hu</p>

                <p className="p-aszf">
                    <em className="em-aszf">
                        Jelen adatvédelmi tájékoztatót a Szolgáltató időről időre frissítheti. A módosításokat a weboldalon tesszük közzé.
                    </em>
                </p>
            </div>
            <Footer />
        </>
    )
}