import emailjs from 'emailjs-com'

const EMAILJS_PUBLIC_KEY = 'xIIuSPofD_wOgzita'
const SERVICE_ID = 'service_hqux1dh'
const TEMPLATE_ID = 'template_iz0nukf'

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
