import emailjs from 'emailjs-com'

const EMAILJS_PUBLIC_KEY = 'xIIuSPofD_wOgzita'
const SERVICE_ID = 'service_hqux1dh'
const TEMPLATE_ID = 'template_iz0nukf'
const ORDER_TEMPLATE_ID = 'template_mh3g2wk' 

emailjs.init(EMAILJS_PUBLIC_KEY)

export const sendWelcomeEmail = async (userEmail, userName) => {
  const email = (userEmail || '').trim()
  const name = (userName || '').trim()

  if (!email) {
    return { success: false, message: 'Nincs email cím a welcome email küldéshez.' }
  }

  try {
    const templateParams = {
      to_email: email,
      email,
      user_email: email,
      recipient: email,
      to_name: name,
      user_name: name,
      name,
      from_name: 'QuickBite',
      reply_to: 'quickbite@outlook.hu'
    }

    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
    return { success: true, message: 'Üdvözlő email elküldve.' }
  } catch {
    return { success: false, message: 'Email küldés sikertelen, de a regisztráció OK.' }
  }
}

export const sendOrderConfirmationEmail = async (
  toEmail,
  toName,
  orderId,
  orderItemsHtml,
  shippingCost,
  totalCost
) => {
  let email = (toEmail || '').trim()
  const name = (toName || '').trim()

  if (!email) {
    const stored = localStorage.getItem('quickbite_user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        if (u.email) {
          email = (u.email || '').trim()
        }
      } catch {}
    }
  }

  if (!email) {
    return { success: false, message: 'Nincs email cím a rendelés visszaigazoláshoz.' }
  }

  try {
    const templateParams = {
      to_email: email,
      email: email,
      user_email: email,
      recipient: email,
      to_name: name,
      user_name: name,
      name,
      from_name: 'QuickBite',
      reply_to: 'quickbite@outlook.hu',
      order_id: orderId || '',
      orderItems: orderItemsHtml || '',
      shipping_cost: shippingCost != null ? String(shippingCost) : '0',
      total_cost: totalCost != null ? String(totalCost) : '0'
    }

    console.log('sendOrderConfirmationEmail params:', templateParams)

    const result = await emailjs.send(SERVICE_ID, ORDER_TEMPLATE_ID, templateParams)
    return { success: true, message: 'Rendelés visszaigazoló email elküldve.', result }
  } catch (err) {
    console.error('Order email send error:', err)
    console.log('Failed templateParams:', {
      to_email: email,
      user_email: email,
      recipient: email
    })
    if (err && err.body) {
      console.error('EmailJS response body:', err.body)
    }
    return { success: false, message: 'Rendelés visszaigazolás email küldése sikertelen.' }
  }
}
