import emailjs from 'emailjs-com'
import { getAuthUser } from '../utils/storage'

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
    const user = getAuthUser()
    if (user?.email) {
      email = (user.email || '').trim()
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

    const result = await emailjs.send(SERVICE_ID, ORDER_TEMPLATE_ID, templateParams)
    return { success: true, message: 'Rendelés visszaigazoló email elküldve.', result }
  } catch (err) {
    if (err && err.body) {
      // Hiba történt az email szolgáltatásban
    }
    return { success: false, message: 'Rendelés visszaigazolás email küldése sikertelen.' }
  }
}