import sgMail from '@sendgrid/mail'
import { Request, Response } from 'express'

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const CONTACT_EMAIL = process.env.CONTACT_PERSONAL_EMAIL

if (!SENDGRID_API_KEY) {
  console.error('⚠️  SENDGRID_API_KEY is not configured')
  console.error('   Email notifications will not work. Set SENDGRID_API_KEY in your environment variables.')
} else if (!CONTACT_EMAIL) {
  console.error('⚠️  CONTACT_PERSONAL_EMAIL is not configured')
  console.error('   Email notifications will not work. Set CONTACT_PERSONAL_EMAIL in your environment variables.')
} else {
  sgMail.setApiKey(SENDGRID_API_KEY)
  console.log('✅ SendGrid initialized successfully')
}

export const sendContactMail = async (req: Request, res: Response) => {
  const { name, email, message } = req.body

  // Validation
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Tous les champs sont requis.' })
    return
  }

  // Check if SendGrid is configured
  if (!SENDGRID_API_KEY || !CONTACT_EMAIL) {
    console.error('SendGrid not configured - cannot send email')
    res.status(500).json({ error: 'Service de messagerie non configuré.' })
    return
  }

  // SendGrid message configuration
  const msg = {
    to: CONTACT_EMAIL, // Your email where you receive contact form messages
    from: CONTACT_EMAIL, // Must be a verified sender in SendGrid
    replyTo: email, // User's email for easy replies
    subject: `Contact Form: ${name}`,
    text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          Nouveau message de contact
        </h2>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;">
            <strong style="color: #555;">Nom:</strong> ${name}
          </p>
          <p style="margin: 10px 0;">
            <strong style="color: #555;">Email:</strong>
            <a href="mailto:${email}" style="color: #007bff;">${email}</a>
          </p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p style="margin: 0; color: #555;"><strong>Message:</strong></p>
          <p style="margin: 10px 0; white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">
          Ce message a été envoyé depuis le formulaire de contact de spaceistheplace.app
        </p>
      </div>
    `
  }

  try {
    await sgMail.send(msg)
    console.log(`✅ Contact email sent successfully from ${email}`)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('❌ SendGrid error:', error)

    // Log detailed error for debugging
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: unknown } }
      console.error('SendGrid response:', sgError.response?.body)
    }

    res.status(500).json({ error: "Erreur lors de l'envoi du message." })
  }
}
