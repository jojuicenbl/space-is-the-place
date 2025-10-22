import nodemailer from 'nodemailer'
import { Request, Response } from 'express'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.CONTACT_PERSONAL_EMAIL,
    pass: process.env.CONTACT_EMAIL_PASS
  }
})

export const sendContactMail = async (req: Request, res: Response) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Tous les champs sont requis.' })
    return
  }

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.CONTACT_PERSONAL_EMAIL,
    subject: 'Nouveau message via le formulaire de contact',
    text: `Nom: ${name}\nEmail: ${email}\n\n${message}`
  }

  try {
    await transporter.sendMail(mailOptions)
    res.status(200).json({ success: true })
  } catch (error) {
    console.error('Erreur envoi mail contact:', error)
    res.status(500).json({ error: "Erreur lors de l'envoi du message." })
  }
}
