import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../components/css/homepage.css';
import '../components/css/restaurant-map.css';

export default function RestaurantMap() {
    const [isOpen, setIsOpen] = useState(false);
    const [restaurants, setRestaurants] = useState([]);
    const miskolcCenter = [48.1031, 20.7784];
    const mapRef = useRef(null);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch('https://localhost:7236/api/Restaurants');
                if (!response.ok) {
                    throw new Error('Nem sikerült betölteni az éttermeket a térképhez.');
                }
                const data = await response.json();

                const mapped = data.map((r) => ({
                    name: r.name,
                    position: [r.latitude, r.longitude],
                    description: r.description
                }));

                setRestaurants(mapped);
            } catch (err) {
                console.error(err);
            }
        };

        fetchRestaurants();
    }, []);

    useEffect(() => {
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                close();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', onKeyDown);
            if (mapRef.current) {
                setTimeout(() => mapRef.current.invalidateSize(), 50);
            }
        }
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, close]);

    return (
        <>
            <button className="btn btn-secondary restaurant-map-open-btn" onClick={open} aria-haspopup="dialog">
                Térkép
            </button>

            {isOpen && createPortal(
                (
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
                                    whenCreated={(map) => {
                                        mapRef.current = map;
                                        setTimeout(() => map.invalidateSize(), 50);
                                    }}
                                    className="restaurant-map-leaflet"
                                    center={miskolcCenter}
                                    zoom={13}
                                    scrollWheelZoom={true}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    {restaurants.map((restaurant, idx) => (
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
                ),
                document.body
            )}
        </>
    );
}
