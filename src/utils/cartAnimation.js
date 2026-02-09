// Animáció amikor egy étel hozzáadódik a kosárhoz
export const animateAddToCart = (sourceElement, itemImage) => {
  console.log('animateAddToCart called', { sourceElement, itemImage })
  
  // Megkeressük a kosár gombot a navbar-ban
  const cartButton = document.querySelector('.cart-btn') || document.querySelector('a[href="/kosar"]')
  
  console.log('Cart button found:', cartButton)
  
  if (!cartButton || !sourceElement) {
    console.log('Missing element:', { cartButton, sourceElement })
    return
  }

  const sourceRect = sourceElement.getBoundingClientRect()
  const targetRect = cartButton.getBoundingClientRect()

  const flyingItem = document.createElement('div')
  flyingItem.className = 'flying-cart-item'
  
  if (itemImage) {
    const img = document.createElement('img')
    img.src = itemImage
    img.alt = 'Kosárba tétel'
    flyingItem.appendChild(img)
  } else {
    flyingItem.textContent = '🍽️'
    flyingItem.style.fontSize = '40px'
  }

  flyingItem.style.position = 'fixed'
  flyingItem.style.left = `${sourceRect.left + sourceRect.width / 2 - 60}px` 
  flyingItem.style.top = `${sourceRect.top + sourceRect.height / 2 - 60}px` 
  flyingItem.style.zIndex = '9999'
  flyingItem.style.pointerEvents = 'none'
  
  console.log('Flying item created at:', { 
    left: flyingItem.style.left, 
    top: flyingItem.style.top 
  })

  document.body.appendChild(flyingItem)

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const targetX = targetRect.left + targetRect.width / 2
      const targetY = targetRect.top + targetRect.height / 2
      
      const translateX = targetX - (sourceRect.left + sourceRect.width / 2)
      const translateY = targetY - (sourceRect.top + sourceRect.height / 2)
      
      console.log('Animating to:', { targetX, targetY, translateX, translateY })

      flyingItem.style.transform = `translate(${translateX}px, ${translateY}px) scale(0.2)`
      flyingItem.style.opacity = '0'

      setTimeout(() => {
        console.log('Animation complete, removing element')
        flyingItem.remove()
        
        if (cartButton) {
          cartButton.classList.add('cart-bump')
          setTimeout(() => {
            cartButton.classList.remove('cart-bump')
          }, 300)
        }
      }, 600)
    })
  })
}
