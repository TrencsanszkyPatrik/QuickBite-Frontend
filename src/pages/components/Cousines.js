import React from 'react'
import '../components/css/CuisineList.css'

const cousines = [
    {
        name: 'Olasz',
        icon: '🍝',
        count: 23
    },
    {
        name: 'Ázsiai',
        icon: '🍜',
        count: 31
    },
    {
        name: 'Mexikói',
        icon: '🌮',
        count: 18
    },
    {
        name: 'Amerikai',
        icon: '🍔',
        count: 27
    },
    {
        name: 'Indiai',
        icon: '🍛',
        count: 15
    },
    {
        name: 'Mediterrán',
        icon: '🥙',
        count: 12
    },
    {
        name: 'Magyar',
        icon: '🫕',
        count: 10
    }
]

export default function Cousines() {
    return (
        <>
            <div className="container">
                <h2 className="section-title">Böngéssz konyhatípus szerint</h2>
                <div className="cuisines-grid">
                    
                    {cousines.map((cousine) => (
                        <div className="cuisine-card">
                            <div className="cuisine-icon">{cousine.icon}</div>
                            <span className="cuisine-title">{cousine.name}</span>
                            <span className="cuisine-meta">{cousine.count} étterem</span>
                        </div>
                    ))}

                </div>
            </div>
        </>
    )
}