import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export interface ContactFormData {
  name: string
  email: string
  message: string
}

export async function sendMail(data: ContactFormData) {
  const response = await axios.post(`${API_URL}/api/contact`, data)
  return response.data
}
