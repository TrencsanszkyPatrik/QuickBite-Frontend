import React, { useEffect, useState } from 'react'
import '../components/css/CuisineList.css'

export default function Cousines({ selectedCuisineId, onSelectCuisine = () => {} }) {
    const [categories, setCategories] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCategoriesAndCounts = async () => {
            try {
                // Kategóriák + éttermek párhuzamos betöltése
                const [categoriesRes, restaurantsRes] = await Promise.all([
                    fetch('https://localhost:7236/api/Categories'),
                    fetch('https://localhost:7236/api/Restaurants')
                ])

                if (!categoriesRes.ok || !restaurantsRes.ok) {
                    throw new Error('Nem sikerült betölteni a kategóriákat vagy éttermeket.')
                }

                const [categoriesData, restaurantsData] = await Promise.all([
                    categoriesRes.json(),
                    restaurantsRes.json()
                ])

                const mapped = categoriesData.map((c) => {
                    const count = restaurantsData.filter(
                        (r) => r.cuisine_id === c.id
                    ).length

                    return {
                        id: c.id,
                        name: c.name,
                        icon: c.icon,
                        count
                    }
                })

                setCategories(mapped)
            } catch (err) {
                console.error(err)
                setError('Hiba történt a kategóriák betöltése közben.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchCategoriesAndCounts()
    }, [])

    return (
        <>
            <div className="container">
                <h2 className="section-title">Böngéssz konyhatípus szerint</h2>
                <div className="cuisines-grid">
                    {isLoading && <p>Kategóriák betöltése...</p>}
                    {error && !isLoading && <p>{error}</p>}
                    {!isLoading && !error && categories.map((category) => {
                        const isSelected = selectedCuisineId === category.id
                        return (
                        <div
                            className={`cuisine-card ${isSelected ? 'selected' : ''}`}
                            key={category.id}
                            onClick={() => onSelectCuisine(category.id)}
                        >
                            <div className="cuisine-icon">{category.icon}</div>
                            <span className="cuisine-title">{category.name}</span>
                            <span className="cuisine-meta">
                                {category.count} étterem
                            </span>
                        </div>
                    )})}

                </div>
            </div>
        </>
    )
}