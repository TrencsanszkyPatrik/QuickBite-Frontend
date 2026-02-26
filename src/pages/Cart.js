import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AddressAutocomplete from '../components/AddressAutocomplete'
import '../styles/cart.css'
import '../styles/modal.css'
import { usePageTitle } from '../utils/usePageTitle'
import { API_BASE, getAuthHeaders } from '../utils/api'
import { showToast } from '../utils/toast'
import { Link } from 'react-router-dom'
import { AsYouType, parsePhoneNumberFromString, validatePhoneNumberLength } from 'libphonenumber-js'

const FALLBACK_PHONE_CODE_OPTIONS = [
  { value: '+36', label: 'HU +36', countryCodes: ['HU'], defaultCountry: 'HU' }
]

const CARD_NAME_LETTERS_REGEX = /^[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+(?:\s+[A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű]+)+$/
const CARD_NAME_FILTER_REGEX = /[^A-Za-zÁÉÍÓÖŐÚÜŰáéíóöőúüű\s]/g

const DEFAULT_PHONE_CODE = FALLBACK_PHONE_CODE_OPTIONS[0].value

export default function Cart() {
  usePageTitle('QuickBite - Kosár')

  const [phoneCodeOptions, setPhoneCodeOptions] = useState(FALLBACK_PHONE_CODE_OPTIONS)
  
  const [cartItems, setCartItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [showCardDetails, setShowCardDetails] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [suggestedItems, setSuggestedItems] = useState([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [showClearCartModal, setShowClearCartModal] = useState(false)
  const [showCheckoutConfirmModal, setShowCheckoutConfirmModal] = useState(false)
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [selectedPhoneCountryCode, setSelectedPhoneCountryCode] = useState(DEFAULT_PHONE_CODE)
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState(false)
  const phoneCodeDropdownRef = useRef(null)
  const phoneCodeOptionRefs = useRef({})
  const phoneCodeTypeBufferRef = useRef('')
  const phoneCodeTypeTimeoutRef = useRef(null)
  const phoneLengthBoundsCacheRef = useRef({})
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    zip: '',
    phone: '',
    instructions: ''
  })
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  })

  const getPhoneConfig = (countryCode) => {
    const selectedOption =
      phoneCodeOptions.find((option) => option.value === countryCode) ||
      phoneCodeOptions[0] ||
      FALLBACK_PHONE_CODE_OPTIONS[0]

    const defaultCountry = selectedOption.defaultCountry || selectedOption.countryCodes?.[0]

    if (selectedOption.value === '+36') {
      return {
        ...selectedOption,
        defaultCountry,
        localMinLength: 9,
        localMaxLength: 9
      }
    }

    if (defaultCountry) {
      if (!phoneLengthBoundsCacheRef.current[defaultCountry]) {
        let minLength = 6
        let maxLength = 12

        for (let len = 1; len <= 15; len += 1) {
          const sample = '9'.repeat(len)
          const lengthCheck = validatePhoneNumberLength(sample, defaultCountry)

          if (lengthCheck !== 'TOO_SHORT' && minLength === 6) {
            minLength = len
          }

          if (lengthCheck === 'TOO_LONG') {
            maxLength = len - 1
            break
          }

          if (len === 15) {
            maxLength = len
          }
        }

        if (maxLength < minLength) {
          maxLength = minLength
        }

        phoneLengthBoundsCacheRef.current[defaultCountry] = { minLength, maxLength }
      }

      const bounds = phoneLengthBoundsCacheRef.current[defaultCountry]
      return {
        ...selectedOption,
        defaultCountry,
        localMinLength: bounds.minLength,
        localMaxLength: bounds.maxLength
      }
    }

    const dialCodeDigitsLength = selectedOption.value.replace(/\D/g, '').length
    const localMaxLength = Math.max(6, 15 - dialCodeDigitsLength)

    return {
      ...selectedOption,
      defaultCountry,
      localMinLength: 6,
      localMaxLength
    }
  }

  const resetPhoneCodeTypeAhead = () => {
    phoneCodeTypeBufferRef.current = ''
    if (phoneCodeTypeTimeoutRef.current) {
      clearTimeout(phoneCodeTypeTimeoutRef.current)
      phoneCodeTypeTimeoutRef.current = null
    }
  }

  const closePhoneCodeList = () => {
    setIsPhoneCodeListOpen(false)
    resetPhoneCodeTypeAhead()
  }

  const applyPhoneCountryCode = (countryCode) => {
    const parsedPhone = parsePhoneValue(deliveryAddress.phone, selectedPhoneCountryCode)
    const nextValue = buildPhoneValue(countryCode, parsedPhone.localDigits)
    setSelectedPhoneCountryCode(countryCode)
    setDeliveryAddress((prev) => ({ ...prev, phone: nextValue }))
  }

  const handlePhoneCodeTypeAhead = (character) => {
    const normalized = character.toLowerCase()
    const nextBuffer = `${phoneCodeTypeBufferRef.current}${normalized}`

    phoneCodeTypeBufferRef.current = nextBuffer
    if (phoneCodeTypeTimeoutRef.current) {
      clearTimeout(phoneCodeTypeTimeoutRef.current)
    }
    phoneCodeTypeTimeoutRef.current = setTimeout(() => {
      phoneCodeTypeBufferRef.current = ''
      phoneCodeTypeTimeoutRef.current = null
    }, 700)

    const matchedOption = phoneCodeOptions.find((option) => {
      const label = option.label.toLowerCase()
      const dial = option.value.toLowerCase()
      return label.startsWith(nextBuffer) || dial.startsWith(nextBuffer)
    })

    if (!matchedOption) return

    applyPhoneCountryCode(matchedOption.value)

    requestAnimationFrame(() => {
      const el = phoneCodeOptionRefs.current[matchedOption.value]
      if (el) {
        el.scrollIntoView({ block: 'nearest' })
      }
    })
  }

  const handlePhoneCodeTriggerKeyDown = (e) => {
    if (e.key === 'Escape') {
      closePhoneCodeList()
      return
    }

    if (e.key.length === 1 && /[a-zA-Z0-9+]/.test(e.key)) {
      e.preventDefault()
      if (!isPhoneCodeListOpen) {
        setIsPhoneCodeListOpen(true)
      }
      handlePhoneCodeTypeAhead(e.key)
    }
  }

  const findCountryCodeFromDigits = (digits) => {
    const sortedByLength = [...phoneCodeOptions]
      .map((option) => option.value.replace('+', ''))
      .sort((a, b) => b.length - a.length)

    for (const code of sortedByLength) {
      if (digits.startsWith(code)) {
        return `+${code}`
      }
    }

    return null
  }

  const parsePhoneValue = (value, fallbackCountryCode = DEFAULT_PHONE_CODE, allowCountryCodeDetection = false) => {
    const raw = typeof value === 'string' ? value.trim() : ''
    let countryCode = fallbackCountryCode
    let digits = raw.replace(/\D/g, '')

    if (allowCountryCodeDetection) {
      const plusMatch = raw.match(/^\s*(\+\d{1,3})/)
      if (plusMatch && phoneCodeOptions.some((option) => option.value === plusMatch[1])) {
        countryCode = plusMatch[1]
        const countryDigits = countryCode.replace('+', '')
        if (digits.startsWith(countryDigits)) {
          digits = digits.slice(countryDigits.length)
        }
      } else if (digits.startsWith('00')) {
        const withoutPrefix = digits.slice(2)
        const detectedCode = findCountryCodeFromDigits(withoutPrefix)
        if (detectedCode) {
          countryCode = detectedCode
          digits = withoutPrefix.slice(detectedCode.replace('+', '').length)
        }
      }
    }

    const selectedCountryDigits = countryCode.replace('+', '')
    if (raw.startsWith(countryCode) && digits.startsWith(selectedCountryDigits)) {
      digits = digits.slice(selectedCountryDigits.length)
    } else if (raw.startsWith(`00${selectedCountryDigits}`) && digits.startsWith(`00${selectedCountryDigits}`)) {
      digits = digits.slice(2 + selectedCountryDigits.length)
    }

    if (countryCode === '+36' && digits.startsWith('06')) {
      digits = digits.slice(2)
    } else if (countryCode === '+36' && digits.startsWith('0')) {
      digits = digits.slice(1)
    }

    const config = getPhoneConfig(countryCode)
    const localDigits = digits.slice(0, config.localMaxLength)

    return { countryCode, localDigits }
  }

  const formatPhoneLocal = (localDigits, countryCode) => {
    if (!localDigits) return ''

    if (countryCode === '+36') {
      const part1 = localDigits.slice(0, 2)
      const part2 = localDigits.slice(2, 5)
      const part3 = localDigits.slice(5, 9)
      return [part1, part2, part3].filter(Boolean).join(' ')
    }

    const phoneConfig = getPhoneConfig(countryCode)
    if (phoneConfig.defaultCountry) {
      const nationalFormatter = new AsYouType(phoneConfig.defaultCountry)
      return nationalFormatter.input(localDigits)
    }

    const formatter = new AsYouType()
    const formatted = formatter.input(`${countryCode}${localDigits}`)
    const escapedCountryCode = countryCode.replace('+', '\\+')
    return formatted.replace(new RegExp(`^${escapedCountryCode}\\s*`), '').trim()
  }

  const buildPhoneValue = (countryCode, localDigits) => {
    const formattedLocal = formatPhoneLocal(localDigits, countryCode)
    return formattedLocal ? `${countryCode} ${formattedLocal}` : ''
  }

  const isValidPhoneNumber = (value) => {
    if (!value) return false
    if (selectedPhoneCountryCode === '+36') {
      const normalized = value.replace(/^\+36\s*/, '').trim()
      return /^\d{2}\s\d{3}\s\d{4}$/.test(normalized)
    }

    const { localDigits } = parsePhoneValue(value, selectedPhoneCountryCode)
    if (!localDigits) return false

    const phoneConfig = getPhoneConfig(selectedPhoneCountryCode)
    if (phoneConfig.defaultCountry) {
      if (validatePhoneNumberLength(localDigits, phoneConfig.defaultCountry)) {
        return false
      }

      const nationalPhoneNumber = parsePhoneNumberFromString(localDigits, phoneConfig.defaultCountry)
      return Boolean(
        nationalPhoneNumber?.isValid() &&
        `+${nationalPhoneNumber.countryCallingCode}` === selectedPhoneCountryCode
      )
    }

    const phoneNumber = parsePhoneNumberFromString(`${selectedPhoneCountryCode}${localDigits}`)
    return Boolean(phoneNumber?.isValid())
  }

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const isValidCardNumber = (value) => {
    if (!value) return false
    const cleaned = value.replace(/\D/g, '')
    return /^\d{16}$/.test(cleaned)
  }

  const isValidExpiry = (value) => {
    if (!value) return false
    const trimmed = value.trim()
    const match = trimmed.match(/^(\d{2})\/(\d{2})$/)
    if (!match) return false

    const month = Number(match[1])
    let year = Number(match[2])
    if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) return false

    const now = new Date()
    const currentYear = now.getFullYear() % 100
    const currentMonth = now.getMonth() + 1

    if (year < currentYear) return false
    if (year === currentYear && month < currentMonth) return false
    return true
  }

  const isValidCvv = (value) => {
    if (!value) return false
    return /^\d{3}$/.test(value.trim())
  }

  const isValidCardName = (value) => {
    if (!value) return false
    const trimmed = value.trim()
    return trimmed.length >= 5 && CARD_NAME_LETTERS_REGEX.test(trimmed)
  }

  useEffect(() => {
    const loadPhoneCodeOptions = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=cca2,idd')
        const countries = Array.isArray(response.data) ? response.data : []
        const groupedByDialCode = new Map()

        countries.forEach((country) => {
          const root = country?.idd?.root
          const suffixes = Array.isArray(country?.idd?.suffixes) ? country.idd.suffixes : []
          const cca2 = typeof country?.cca2 === 'string' ? country.cca2.toUpperCase() : null
          if (!root || !suffixes.length || !cca2) return

          suffixes.forEach((suffix) => {
            const dialCode = `${root}${suffix}`
            if (!/^\+\d{1,4}$/.test(dialCode)) return

            const existing = groupedByDialCode.get(dialCode)
            if (existing) {
              existing.countryCodes.add(cca2)
              return
            }

            groupedByDialCode.set(dialCode, {
              value: dialCode,
              countryCodes: new Set([cca2])
            })
          })
        })

        const fetchedOptions = [...groupedByDialCode.values()]
          .map((item) => ({
            value: item.value,
            label: `${[...item.countryCodes].sort().join('/')} ${item.value}`,
            countryCodes: [...item.countryCodes].sort(),
            defaultCountry: [...item.countryCodes].sort()[0]
          }))
          .sort((a, b) => a.label.localeCompare(b.label))

        if (fetchedOptions.length > 0) {
          setPhoneCodeOptions(fetchedOptions)
          return
        }
      } catch (error) {
        console.error('Országkódok API betöltése sikertelen, fallback lista marad:', error)
      }

      setPhoneCodeOptions(FALLBACK_PHONE_CODE_OPTIONS)
    }

    loadPhoneCodeOptions()
  }, [])

  useEffect(() => {
    if (!phoneCodeOptions.some((option) => option.value === selectedPhoneCountryCode)) {
      setSelectedPhoneCountryCode(phoneCodeOptions[0]?.value || DEFAULT_PHONE_CODE)
    }
  }, [phoneCodeOptions, selectedPhoneCountryCode])

  useEffect(() => {
    const token = localStorage.getItem('quickbite_token')
    const userData = localStorage.getItem('quickbite_user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      loadUserProfile()
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  useEffect(() => {
    if (!isPhoneCodeListOpen) return

    const handleOutsideClick = (event) => {
      if (!phoneCodeDropdownRef.current?.contains(event.target)) {
        closePhoneCodeList()
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closePhoneCodeList()
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isPhoneCodeListOpen])

  useEffect(() => {
    return () => {
      resetPhoneCodeTypeAhead()
    }
  }, [])

  const loadUserProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/Profile/me`, { headers: getAuthHeaders() })
      const data = res.data
      if (data) {
        setUserProfile(data)
        
        const defaultAddress = data.addresses?.find(a => a.isDefault)
        const defaultPayment = data.paymentMethods?.find(p => p.isDefault)
        
        setDeliveryAddress(prev => ({
          ...prev,
          fullName: data.name || prev.fullName,
          phone: data.phone || prev.phone
        }))

        if (data.phone) {
          const parsedPhone = parsePhoneValue(data.phone, selectedPhoneCountryCode, true)
          setSelectedPhoneCountryCode(parsedPhone.countryCode)
          setDeliveryAddress(prev => ({
            ...prev,
            phone: buildPhoneValue(parsedPhone.countryCode, parsedPhone.localDigits)
          }))
        }
        
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id)
          setDeliveryAddress(prev => ({
            ...prev,
            address: defaultAddress.addressLine,
            city: defaultAddress.city,
            zip: defaultAddress.zipCode
          }))
        }
        
        if (defaultPayment) {
          setSelectedPaymentId(defaultPayment.id)
          if (defaultPayment.type === 'card') {
            setPaymentMethod('credit-card')
            setShowCardDetails(true)
          } else if (defaultPayment.type === 'cash') {
            setPaymentMethod('cash')
            setShowCardDetails(false)
          }
        }
      }
    } catch (error) {
      console.error('Profil betöltése sikertelen:', error)
    }
  }

  useEffect(() => {
    const savedCart = localStorage.getItem('quickbite_cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Hiba a kosár betöltése közben:', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quickbite_cart', JSON.stringify(cartItems))
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Javasolt ételek betöltése ha van étterem a kosárban
    if (cartItems.length > 0 && cartItems[0].restaurantId) {
      loadSuggestedItems(cartItems[0].restaurantId)
    } else {
      setSuggestedItems([])
    }
  }, [cartItems])

  const increaseQuantity = (index) => {
    const newCart = [...cartItems]
    newCart[index].quantity += 1
    setCartItems(newCart)
  }

  const decreaseQuantity = (index) => {
    const newCart = [...cartItems]
    if (newCart[index].quantity > 1) {
      newCart[index].quantity -= 1
      setCartItems(newCart)
    }
  }
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Kérlek, add meg a kuponkódot')
      return
    }

    setCouponError('')
    setCouponSuccess('')
    setIsValidatingCoupon(true)

    try {
      const orderAmount = calculateSubtotal() + calculateDeliveryFee()
      const restaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null

      const endpoint = '/validate'
      const headers = {
        'Content-Type': 'application/json'
      }
      if (isLoggedIn) {
        Object.assign(headers, getAuthHeaders())
      }

      const response = await axios.post(
        `${API_BASE}/Coupons${endpoint}`,
        {
          code: couponCode.trim(),
          orderAmount: orderAmount,
          restaurantId: restaurantId
        },
        { headers: headers }
      )

      const data = response.data
      console.log('Kupon válasz:', data)

      if (data.isValid) {
        setAppliedCoupon(data)
        setCouponSuccess(data.message)
        setCouponError('')
      } else {
        setCouponError(data.message)
        setCouponSuccess('')
        setAppliedCoupon(null)
      }
    } catch (error) {
      console.error('Kupon validálási hiba:', error)
      setCouponError('Hiba történt a kupon validálása során')
      setAppliedCoupon(null)
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    setCouponSuccess('')
  }
  const removeItem = (index) => {
    const newCart = cartItems.filter((_, i) => i !== index)
    setCartItems(newCart)
  }

  const clearCart = () => {
    setShowClearCartModal(true)
  }

  const handleClearCartConfirm = () => {
    setCartItems([])
    setShowClearCartModal(false)
  }

  const handleClearCartCancel = () => {
    setShowClearCartModal(false)
  }

  const handleCheckoutConfirm = async () => {
    setIsPlacingOrder(true)
    try {
      await processOrder()
      setShowCheckoutConfirmModal(false)
      setShowOrderSuccessModal(true)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const handleCheckoutCancel = () => {
    if (isPlacingOrder) return
    setShowCheckoutConfirmModal(false)
  }

  const closeOrderSuccessModal = () => {
    setShowOrderSuccessModal(false)
  }

  const handleCheckout = (e) => {
    e.preventDefault()

    const { localDigits: phoneLocalDigits } = parsePhoneValue(deliveryAddress.phone, selectedPhoneCountryCode)
    
    if (cartItems.length === 0) {
      alert('A kosár üres!')
      return
    }

    // Cím ellenőrzés
    if (!deliveryAddress.fullName || !deliveryAddress.address || !deliveryAddress.city ||
        !deliveryAddress.zip || !phoneLocalDigits) {
      alert('Kérjük, töltsd ki az összes kötelező mezőt!')
      return
    }

    if (!isValidPhoneNumber(deliveryAddress.phone)) {
      showToast.error('Érvénytelen telefonszám. Kérlek ellenőrizd a kiválasztott országkódnak megfelelő formátumot!')
      return
    }

    if (paymentMethod === 'credit-card' && !selectedPaymentId) {
      if (!cardDetails.cardName?.trim()) {
        showToast.error('Kérlek add meg a kártyabirtokos nevét!')
        return
      }

      if (!cardDetails.cardNumber || !cardDetails.expiry || !cardDetails.cvv) {
        showToast.error('Kérjük, add meg a bankkártya adatait vagy válassz mentett fizetési módot!')
        return
      }

      if (!isValidCardNumber(cardDetails.cardNumber)) {
        showToast.error('Érvénytelen kártyaszám. Kérlek ellenőrizd a 16 számjegyet!')
        return
      }

      if (!isValidExpiry(cardDetails.expiry)) {
        showToast.error('Érvénytelen lejárati dátum. A helyes formátum: MM/YY (pl. 03/29).')
        return
      }

      if (!isValidCvv(cardDetails.cvv)) {
        showToast.error('Érvénytelen CVC/CVV kód. Pontosan 3 számjegyet adj meg!')
        return
      }

      if (!isValidCardName(cardDetails.cardName)) {
        showToast.error('A kártyabirtokos név csak betűket tartalmazhat, legalább két szóban.')
        return
      }
    }

    setShowCheckoutConfirmModal(true)
  }

  const processOrder = async () => {
    // Ha van alkalmazott kupon és be van jelentkezve, felhasználjuk a kupont
    if (appliedCoupon && isLoggedIn) {
      try {
        const orderAmount = calculateSubtotal() + calculateDeliveryFee()
        const restaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null
        
        await axios.post(
          `${API_BASE}/Coupons/apply`,
          {
            code: appliedCoupon.coupon.code,
            orderAmount: orderAmount,
            restaurantId: restaurantId
          },
          {
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders()
            }
          }
        )
      } catch (error) {
        console.error('Hiba a kupon felhasználása során:', error)
      }
    }

    if (isLoggedIn) {
      try {
        const orderPayload = {
          items: cartItems.map(item => ({
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.img || null
          })),
          delivery: {
            fullName: deliveryAddress.fullName,
            address: deliveryAddress.address,
            city: deliveryAddress.city,
            zip: deliveryAddress.zip,
            phone: deliveryAddress.phone,
            instructions: deliveryAddress.instructions || null
          },
          paymentMethod: paymentMethod,
          savedAddressId: selectedAddressId || null,
          savedPaymentId: selectedPaymentId || null,
          subtotal: calculateSubtotal(),
          deliveryFee: calculateDeliveryFee(),
          discount: appliedCoupon ? appliedCoupon.discountAmount : 0,
          couponCode: appliedCoupon ? appliedCoupon.coupon.code : null,
          total: calculateTotal(),
          restaurantId: cartItems[0]?.restaurantId,
          restaurantName: cartItems[0]?.restaurantName || ''
        }
        await axios.post(`${API_BASE}/Orders`, orderPayload, {
          headers: getAuthHeaders()
        })
      } catch (error) {
        console.error('Hiba a rendelés mentésekor:', error)
        alert('A rendelés leadása sikertelen volt. Próbáld újra!')
        return
      }
    }
    
    setCartItems([])
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
    setCouponSuccess('')
    
    
    if (!selectedAddressId) {
      setDeliveryAddress({
        fullName: userProfile?.name || '',
        address: '',
        city: '',
        zip: '',
        phone: userProfile?.phone || '',
        instructions: ''
      })
    }
    if (!selectedPaymentId) {
      setCardDetails({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: ''
      })
    }
  }

  
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const calculateDeliveryFee = () => {
    const hasFreeDelivery = cartItems.length > 0 && cartItems[0].restaurantFreeDelivery
    
    if (!hasFreeDelivery) {
      return 499 
    }
    
    const subtotal = calculateSubtotal()
    return subtotal > 5000 ? 0 : 499
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const deliveryFee = calculateDeliveryFee()
    const discount = appliedCoupon ? appliedCoupon.discountAmount : 0
    return Math.max(0, subtotal + deliveryFee - discount)
  }

  const loadSuggestedItems = async (restaurantId) => {
    setIsLoadingSuggestions(true)
    try {
      const res = await axios.get(`${API_BASE}/MenuItems/restaurant/${restaurantId}`)
      const allItems = res.data || []
      if (allItems) {
        
        const cartItemIds = cartItems.map(item => item.id)
        const filtered = allItems.filter(item => !cartItemIds.includes(item.id))
        
        const shuffled = [...filtered].sort(() => Math.random() - 0.5)
        
        const desserts = shuffled.filter(item => 
          item.category?.toLowerCase().includes('desszert') ||
          item.category?.toLowerCase().includes('édesség') ||
          item.name?.toLowerCase().includes('süti') ||
          item.name?.toLowerCase().includes('torta')
        )
        
        const popular = shuffled.filter(item => item.isPopular || item.rating >= 4.5)
        
        let suggestions = []
        
        if (desserts.length > 0) {
          const randomDesserts = desserts.sort(() => Math.random() - 0.5).slice(0, Math.min(2, desserts.length))
          suggestions.push(...randomDesserts)
        }
        
        if (popular.length > 0) {
          const randomPopular = popular
            .filter(item => !suggestions.includes(item))
            .sort(() => Math.random() - 0.5)
            .slice(0, Math.min(2, popular.length))
          suggestions.push(...randomPopular)
        }
        
        // Ha kevés az ajánlat, töltsük fel véletlenszerű ételekkel
        if (suggestions.length < 4 && filtered.length > suggestions.length) {
          const remaining = shuffled.filter(item => !suggestions.includes(item))
          const randomRemaining = remaining.slice(0, 4 - suggestions.length)
          suggestions.push(...randomRemaining)
        }
        
        setSuggestedItems(suggestions.slice(0, 6))
      }
    } catch (error) {
      console.error('Javasolt ételek betöltése sikertelen:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const addSuggestedToCart = (item) => {
    const newItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      desc: item.description,
      img: item.image_url || '/img/EtelKepek/default.png',
      quantity: 1,
      restaurantId: item.restaurantId,
      restaurantName: cartItems[0]?.restaurantName,
      restaurantFreeDelivery: cartItems[0]?.restaurantFreeDelivery
    }
    setCartItems([...cartItems, newItem])
  }

  // Csak egy etterembol rendeles
  const restaurantId = cartItems.length > 0 ? cartItems[0].restaurantId : null
  const restaurantName = cartItems.length > 0 ? cartItems[0].restaurantName : null

  const checkoutPaymentLabel = selectedPaymentId
    ? userProfile?.paymentMethods?.find((pm) => pm.id === selectedPaymentId)?.displayName || 'Mentett fizetési mód'
    : paymentMethod === 'credit-card'
      ? 'Bankkártya'
      : paymentMethod === 'cash'
        ? 'Készpénz'
        : paymentMethod

  return (
    <>
      <Navbar />
      {showClearCartModal && (
        <div className="modal-overlay" onClick={handleClearCartCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Kosár ürítése</h2>
              <button className="modal-close" onClick={handleClearCartCancel} aria-label="Bezárás">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">⚠️</div>
              <p className="modal-text">
                A kosaradban lévő összes tétel törlődni fog{restaurantName ? (
                  <>
                    {' '}innen: <strong>{restaurantName}</strong>
                  </>
                ) : null}
                .
              </p>
              <p className="modal-question">Biztosan üríted a kosarat?</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-cancel" onClick={handleClearCartCancel}>
                Mégse
              </button>
              <button className="modal-btn modal-btn-confirm" onClick={handleClearCartConfirm}>
                Kosár ürítése
              </button>
            </div>
          </div>
        </div>
      )}
      {showCheckoutConfirmModal && (
        <div className="modal-overlay" onClick={handleCheckoutCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rendelés leadása</h2>
              <button className="modal-close" onClick={handleCheckoutCancel} aria-label="Bezárás">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">🧾</div>
              <p className="modal-text">
                Ellenőrizd a rendelésed adatait, majd erősítsd meg a leadást.
              </p>
              {restaurantName && (
                <p className="modal-text">
                  Étterem: <strong>{restaurantName}</strong>
                </p>
              )}
              <p className="modal-text">
                Fizetési mód: <strong>{checkoutPaymentLabel}</strong>
              </p>
              <p className="modal-text">
                Szállítás: <strong>{deliveryAddress.zip} {deliveryAddress.city}, {deliveryAddress.address}</strong>
              </p>
              <p className="modal-text">
                Összesen fizetendő: <strong>{calculateTotal().toLocaleString()} Ft</strong>
              </p>
              <p className="modal-question">Leadod a rendelést?</p>
            </div>
            <div className="modal-actions">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={handleCheckoutCancel}
                disabled={isPlacingOrder}
              >
                Mégse
              </button>
              <button
                className="modal-btn modal-btn-confirm"
                onClick={handleCheckoutConfirm}
                disabled={isPlacingOrder}
              >
                {isPlacingOrder ? 'Folyamatban...' : 'Rendelés leadása'}
              </button>
            </div>
          </div>
        </div>
      )}
      {showOrderSuccessModal && (
        <div className="modal-overlay" onClick={closeOrderSuccessModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sikeres rendelés</h2>
              <button className="modal-close" onClick={closeOrderSuccessModal} aria-label="Bezárás">
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-icon">✅</div>
              <p className="modal-text">Köszönjük a vásárlást! A rendelésedet rögzítettük.</p>
              {isLoggedIn && (
                <p className="modal-text">
                  A <Link to="/rendelesek" onClick={closeOrderSuccessModal}>Rendeléseim</Link> oldalon megtekintheted a rendelést.
                </p>
              )}
              <p className="modal-question">Jó étvágyat!</p>
            </div>
            <div className="modal-actions">
              <button className="modal-btn modal-btn-confirm" onClick={closeOrderSuccessModal}>
                Rendben
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="cart-page">
        <div className="cart-container">
          <div className="cart-header">
            {cartItems.length > 0 && (
              <button className="clear-cart-btn" onClick={clearCart}>
                Kosár ürítése
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h2>A kosarad üres</h2>
              <p>Adj hozzá ételeket a rendeléshez!</p>
              <Link to="/ettermek" className="browse-btn">Étteremek böngészése</Link>
            </div>
          ) : (
            <div className="cart-content">
              <div className="cart-items-section">
                {restaurantName && (
                  <div className="restaurant-info-banner">
                    <span className="restaurant-icon">🏪</span>
                    <div>
                      <h3>{restaurantName}</h3>
                      <p>Egyszerre csak egy étteremből rendelhetsz</p>
                    </div>
                  </div>
                )}

                <div className="cart-items">
                  {cartItems.map((item, index) => (
                    <div key={index} className="cart-item">
                      <img 
                        src={item.img || '/img/EtelKepek/default.png'} 
                        alt={item.name} 
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h3>{item.name}</h3>
                        {item.desc && <p className="item-description">{item.desc}</p>}
                        <p className="item-price">{item.price.toLocaleString()} Ft</p>
                      </div>
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button 
                            className="quantity-btn" 
                            onClick={() => decreaseQuantity(index)}
                          >
                            −
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            className="quantity-btn" 
                            onClick={() => increaseQuantity(index)}
                          >
                            +
                          </button>
                        </div>
                        <p className="item-total">{(item.price * item.quantity).toLocaleString()} Ft</p>
                        <button 
                          className="remove-btn" 
                          onClick={() => removeItem(index)}
                          title="Eltávolítás"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                 {suggestedItems.length > 0 && (
                  <div className="suggested-items-section">
                    <h3>Hiányzik valami?</h3>
                    <p className="suggested-subtitle">Ezeket is sokan rendelik ebből az étteremből</p>
                    <div className="suggested-items-grid">
                      {suggestedItems.map((item) => (
                        <div key={item.id} className="suggested-item">
                          <img 
                            src={item.image_url || '/img/EtelKepek/default.png'} 
                            alt={item.name}
                            className="suggested-item-image"
                          />
                          <div className="suggested-item-info">
                            <h4>{item.name}</h4>
                            {item.description && (
                              <p className="suggested-item-desc">{item.description.substring(0, 60)}...</p>
                            )}
                            <div className="suggested-item-footer">
                              <span className="suggested-item-price">{item.price.toLocaleString()} Ft</span>
                              <button 
                                className="suggested-add-btn"
                                onClick={() => addSuggestedToCart(item)}
                                title="Hozzáadás a kosárhoz"
                              >
                                <i className="bi bi-plus-lg"></i> Kosárba
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="cart-sidebar">
                <div className="order-summary">
                  <h3>Rendelés összesítő</h3>
                  
                  {!appliedCoupon ? (
                    <div className="coupon-section">
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          placeholder="Kuponkód"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="coupon-input"
                          disabled={isValidatingCoupon || cartItems.length === 0}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !couponCode.trim() || cartItems.length === 0}
                          className="coupon-apply-btn"
                        >
                          {isValidatingCoupon ? 'Ellenőrzés...' : 'Alkalmazás'}
                        </button>
                      </div>
                      {couponError && <p className="coupon-error">{couponError}</p>}
                      {couponSuccess && <p className="coupon-success">{couponSuccess}</p>}
                    </div>
                  ) : (
                    <div className="applied-coupon">
                      <div className="coupon-badge">
                        <i className="bi bi-tag-fill"></i>
                        <span>{appliedCoupon.coupon.code}</span>
                        <button 
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="remove-coupon-btn"
                          title="Kupon eltávolítása"
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </div>
                      <p className="coupon-description">{appliedCoupon.coupon.description}</p>
                    </div>
                  )}
                  
                  <div className="summary-row">
                    <span>Részösszeg:</span>
                    <span>{calculateSubtotal().toLocaleString()} Ft</span>
                  </div>
                  <div className="summary-row">
                    <span>Szállítási díj:</span>
                    <span>
                      {calculateDeliveryFee() === 0 ? (
                        <span className="free-delivery">Ingyenes</span>
                      ) : (
                        `${calculateDeliveryFee()} Ft`
                      )}
                    </span>
                  </div>
                  {appliedCoupon && (
                    <div className="summary-row discount">
                      <span>Kedvezmény:</span>
                      <span className="discount-amount">-{appliedCoupon.discountAmount.toLocaleString()} Ft</span>
                    </div>
                  )}
                  {cartItems.length > 0 && cartItems[0].restaurantFreeDelivery && calculateSubtotal() < 5000 && calculateSubtotal() > 0 && (
                    <p className="free-delivery-info">
                      Még {(5000 - calculateSubtotal()).toLocaleString()} Ft és ingyenes a szállítás!
                    </p>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-row total">
                    <span>Összesen:</span>
                    <span className="total-amount">{calculateTotal().toLocaleString()} Ft</span>
                  </div>
                </div>

                {!isLoggedIn && (
                  <div className="login-suggestion">
                    <i className="bi bi-info-circle"></i>
                    <p>Jelentkezz be a gyorsabb rendeléshez!</p>
                    <a href="/bejelentkezes" className="login-link">Bejelentkezés</a>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="checkout-form">
                  <h3>Szállítási adatok</h3>
                  
                  {isLoggedIn && userProfile?.addresses && userProfile.addresses.length > 0 && (
                    <div className="saved-addresses">
                      <label className="section-label">Mentett címek</label>
                      <div className="address-options">
                        {userProfile.addresses.map((addr) => (
                          <label 
                            key={addr.id} 
                            className={`address-option ${selectedAddressId === addr.id && !useNewAddress ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === addr.id && !useNewAddress}
                              onChange={() => {
                                setSelectedAddressId(addr.id)
                                setUseNewAddress(false)
                                setDeliveryAddress({
                                  ...deliveryAddress,
                                  address: addr.addressLine,
                                  city: addr.city,
                                  zip: addr.zipCode,
                                  instructions: ''
                                })
                              }}
                            />
                            <div className="address-content">
                              <span className="address-label">{addr.label}</span>
                              <span className="address-detail">
                                {addr.addressLine}, {addr.zipCode} {addr.city}
                              </span>
                            </div>
                          </label>
                        ))}
                        <label className={`address-option ${useNewAddress ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="savedAddress"
                            checked={useNewAddress}
                            onChange={() => {
                              setUseNewAddress(true)
                              setSelectedAddressId(null)
                              setDeliveryAddress({
                                ...deliveryAddress,
                                address: '',
                                city: '',
                                zip: '',
                                instructions: ''
                              })
                            }}
                          />
                          <div className="address-content">
                            <span className="address-label">Új cím használata</span>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="fullName">Név *</label>
                    <input
                      type="text"
                      id="fullName"
                      value={deliveryAddress.fullName}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, fullName: e.target.value})}
                      placeholder="Teljes név"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Telefonszám *</label>
                    <div className="phone-input-row">
                      {(() => {
                        const parsedPhone = parsePhoneValue(deliveryAddress.phone, selectedPhoneCountryCode)
                        const phoneConfig = getPhoneConfig(parsedPhone.countryCode)
                        const phonePlaceholder =
                          parsedPhone.countryCode === '+36'
                            ? '30 123 4567'
                            : formatPhoneLocal('9'.repeat(phoneConfig.localMaxLength), parsedPhone.countryCode)
                        const phoneInputMaxLength = phonePlaceholder.length
                        return (
                          <>
                      <div className="phone-code-dropdown" ref={phoneCodeDropdownRef}>
                        <button
                          type="button"
                          id="phoneCountryCode"
                          className="phone-code-select"
                          aria-haspopup="listbox"
                          aria-expanded={isPhoneCodeListOpen}
                          onClick={() => setIsPhoneCodeListOpen((prev) => !prev)}
                          onKeyDown={handlePhoneCodeTriggerKeyDown}
                        >
                          {getPhoneConfig(selectedPhoneCountryCode).label}
                        </button>

                        {isPhoneCodeListOpen && (
                          <div className="phone-code-dropdown-list" role="listbox" aria-label="Országkód lista">
                            {phoneCodeOptions.map((option) => (
                              <button
                                type="button"
                                key={option.value}
                                ref={(el) => {
                                  phoneCodeOptionRefs.current[option.value] = el
                                }}
                                className={`phone-code-option ${selectedPhoneCountryCode === option.value ? 'active' : ''}`}
                                onClick={() => {
                                  applyPhoneCountryCode(option.value)
                                  closePhoneCodeList()
                                }}
                                onKeyDown={handlePhoneCodeTriggerKeyDown}
                                role="option"
                                aria-selected={selectedPhoneCountryCode === option.value}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        inputMode="numeric"
                        value={formatPhoneLocal(parsedPhone.localDigits, parsedPhone.countryCode)}
                        maxLength={phoneInputMaxLength}
                        onChange={(e) => {
                          const numericOnly = e.target.value.replace(/\D/g, '')
                          const maxLength = phoneConfig.localMaxLength
                          const localDigits = numericOnly.slice(0, maxLength)
                          const nextValue = buildPhoneValue(parsedPhone.countryCode, localDigits)
                          setDeliveryAddress({ ...deliveryAddress, phone: nextValue })
                        }}
                        placeholder={phonePlaceholder}
                        required
                      />
                          </>
                        )
                      })()}
                    </div>
                  </div>

                  {(!isLoggedIn || !userProfile?.addresses || userProfile.addresses.length === 0 || useNewAddress) && (
                    <>
                      <div className="form-group">
                        <label htmlFor="city">Város *</label>
                        <input
                          type="text"
                          id="city"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({...deliveryAddress, city: e.target.value})}
                          placeholder="Budapest"
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="zip">Irányítószám *</label>
                          <input
                            type="text"
                            id="zip"
                            value={deliveryAddress.zip}
                            onChange={(e) => setDeliveryAddress({...deliveryAddress, zip: e.target.value})}
                            placeholder="1234"
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="address">Cím (utca, házszám) *</label>
                        <AddressAutocomplete
                          value={deliveryAddress.address}
                          onChange={(value) => setDeliveryAddress({...deliveryAddress, address: value})}
                          onAddressSelect={(addressData) => setDeliveryAddress({
                            ...deliveryAddress,
                            address: addressData.addressLine,
                            city: addressData.city,
                            zip: addressData.zipCode
                          })}
                          placeholder="Utca, házszám, emelet, ajtó"
                          required
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="instructions">További megjegyzések</label>
                    <textarea
                      id="instructions"
                      value={deliveryAddress.instructions}
                      onChange={(e) => setDeliveryAddress({...deliveryAddress, instructions: e.target.value})}
                      placeholder="Pl.: Csengessen kétszer"
                      rows="3"
                    />
                  </div>

                  <h3>Fizetési mód</h3>
                  
                  {isLoggedIn && userProfile?.paymentMethods && userProfile.paymentMethods.length > 0 && (
                    <div className="saved-payment-methods">
                      <label className="section-label">Mentett fizetési módok</label>
                      <div className="payment-options-list">
                        {userProfile.paymentMethods.map((pm) => (
                          <label 
                            key={pm.id} 
                            className={`payment-option ${selectedPaymentId === pm.id ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="savedPayment"
                              checked={selectedPaymentId === pm.id}
                              onChange={() => {
                                setSelectedPaymentId(pm.id)
                                setPaymentMethod(pm.type === 'card' ? 'credit-card' : pm.type)
                                setShowCardDetails(false)
                              }}
                            />
                            <div className="payment-content">
                              <span className="payment-icon">
                                {pm.type === 'card' && '💳'}
                                {pm.type === 'cash' && '💵'}
                                {pm.type === 'szep' && '🎫'}
                              </span>
                              <div>
                                <span className="payment-label">{pm.displayName}</span>
                                {pm.lastFourDigits && (
                                  <span className="payment-detail"> •••• {pm.lastFourDigits}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                      <div className="payment-divider">vagy válassz új fizetési módot:</div>
                    </div>
                  )}

                  <div className="payment-methods">
                    <label className={`payment-option ${paymentMethod === 'cash' && !selectedPaymentId ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash' && !selectedPaymentId}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value)
                          setShowCardDetails(false)
                          setSelectedPaymentId(null)
                        }}
                      />
                      <div className="payment-content">
                        <span className="payment-icon">💵</span>
                        <span>Készpénz kézbesítéskor</span>
                      </div>
                    </label>
                    <label className={`payment-option ${paymentMethod === 'credit-card' && !selectedPaymentId ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="credit-card"
                        checked={paymentMethod === 'credit-card' && !selectedPaymentId}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value)
                          setShowCardDetails(true)
                          setSelectedPaymentId(null)
                        }}
                      />
                      <div className="payment-content">
                        <span className="payment-icon">💳</span>
                        <span>Bankkártya</span>
                      </div>
                    </label>
                  </div>

                  {showCardDetails && !selectedPaymentId && (
                    <div className="card-details">
                      <div className="form-group">
                        <label htmlFor="cardNumber">Kártyaszám *</label>
                        <input
                          type="text"
                          id="cardNumber"
                          inputMode="numeric"
                          value={formatCardNumber(cardDetails.cardNumber)}
                          onChange={(e) => {
                            const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 16)
                            setCardDetails({ ...cardDetails, cardNumber: numericOnly })
                          }}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                          required={paymentMethod === 'credit-card' && !selectedPaymentId}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="expiry">Lejárati dátum *</label>
                          <input
                            type="text"
                            id="expiry"
                            inputMode="numeric"
                            value={cardDetails.expiry}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                              const formatted = digits.length > 2
                                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                                : digits
                              setCardDetails({ ...cardDetails, expiry: formatted })
                            }}
                            placeholder="00/00"
                            maxLength="5"
                            required={paymentMethod === 'credit-card' && !selectedPaymentId}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="cvv">CVV/CVC *</label>
                          <input
                            type="text"
                            id="cvv"
                            inputMode="numeric"
                            value={cardDetails.cvv}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, '').slice(0, 3)
                              setCardDetails({ ...cardDetails, cvv: digits })
                            }}
                            placeholder="123"
                            maxLength="3"
                            required={paymentMethod === 'credit-card' && !selectedPaymentId}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="cardName">Kártyabirtokos neve *</label>
                        <input
                          type="text"
                          id="cardName"
                          value={cardDetails.cardName}
                          onChange={(e) => {
                            const lettersOnly = e.target.value.replace(CARD_NAME_FILTER_REGEX, '')
                            const normalized = lettersOnly.replace(/\s{2,}/g, ' ').replace(/^\s+/, '')
                            setCardDetails({ ...cardDetails, cardName: normalized })
                          }}
                          placeholder="Név a kártyán"
                          required={paymentMethod === 'credit-card' && !selectedPaymentId}
                        />
                      </div>
                    </div>
                  )}

                  <button type="submit" className="checkout-btn">
                    Rendelés leadása
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
