import { useState, useEffect, useRef } from 'react'
import { GEOAPIFY_API_KEY } from '../utils/api'

export default function AddressAutocomplete({ value, onChange, onAddressSelect, placeholder, required = false }) {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //Minimum 3 char
  const fetchSuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${GEOAPIFY_API_KEY}&limit=5&format=json`
      )

      if (!response.ok) {
        throw new Error('Autocomplete API error')
      }

      const data = await response.json()
      setSuggestions(data.results || [])
    } catch (error) {
      console.error('Address autocomplete error:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    fetchSuggestions(newValue)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (suggestion) => {
    if (onAddressSelect) {
       //Szétszedett címadatok
        const addressData = {
        addressLine: suggestion.street 
          ? (suggestion.housenumber ? `${suggestion.street} ${suggestion.housenumber}`.trim() : suggestion.street)
          : suggestion.address_line1 || '',
        city: suggestion.city || suggestion.state || '',
        zipCode: suggestion.postcode || ''
      }
      onAddressSelect(addressData)
    } else {
   //Csak a formázott címek
      const fullAddress = suggestion.formatted || suggestion.address_line1 || ''
      onChange(fullAddress)
    }
    setShowSuggestions(false)
  }

  return (
    <div className="address-autocomplete-container">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => value.length >= 3 && setShowSuggestions(true)}
        placeholder={placeholder}
        required={required}
        className="address-autocomplete-input"
      />
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div ref={suggestionsRef} className="address-autocomplete-suggestions">
          {isLoading && (
            <div className="address-autocomplete-loading">Keresés...</div>
          )}
          {!isLoading && suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="address-autocomplete-suggestion"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.formatted || `${suggestion.address_line1}, ${suggestion.city}`}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}