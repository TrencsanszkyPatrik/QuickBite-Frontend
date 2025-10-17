import React, { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/css/homepage.css';
import '../components/css/restaurant-map.css';

//Ehelyett majd Fetch lesz, a saját adatbázisból
const miskolcRestaurants = [
    {
        name: "Anyukám Mondta",
        position: [48.1046, 20.7915],
        description: "Kedvelt olasz étterem Miskolc közelében."
    },
    {
        name: "Végállomás Bistorant",
        position: [48.0996, 20.7786],
        description: "Modern magyar konyha, helyi alapanyagokkal."
    },
    {
        name: "Zip's Brewhouse",
        position: [48.1042, 20.7917],
        description: "Kézműves sörök és gasztro pub."
    },
    {
        name: "Calypso Kisvendéglő",
        position: [48.0991, 20.7837],
        description: "Hagyományos magyar ételek barátságos környezetben."
    }
];
export default function RestaurantMap() {
    const [isOpen, setIsOpen] = useState(false);
    const miskolcCenter = [48.1031, 20.7784];

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                close();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', onKeyDown);
        }
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, close]);

    return (
        <>
            <button className="btn btn-secondary restaurant-map-open-btn" onClick={open} aria-haspopup="dialog">
                Térkép
            </button>

            {isOpen && (
                <div className="restaurant-map-modal-overlay" onClick={close}>
                    <div
                        className="restaurant-map-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Étterem térkép és kereső"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="restaurant-map-modal-header">
                            <h2 className="restaurant-map-title">Keresés térképen</h2>
                            <button className="btn restaurant-map-close-btn" onClick={close} aria-label="Térkép bezárása">✕</button>
                        </div>
                        <div className="restaurant-map-search">
                            <input type="text" placeholder="📍 Cím vagy terület" aria-label="Cím vagy terület" />
                            <input type="text" placeholder="🍕 Étel vagy étterem" aria-label="Étel vagy étterem" />
                            <button className="btn btn-primary">Keresés</button>
                        </div>
                        <div className="restaurant-map-map-section">
                            <MapContainer
                                className="restaurant-map-leaflet"
                                center={miskolcCenter}
                                zoom={13}
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {miskolcRestaurants.map((restaurant, idx) => (
                                    <Marker key={idx} position={restaurant.position}>
                                        <Popup>
                                            <strong>{restaurant.name}</strong>
                                            <br />
                                            {restaurant.description}
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
