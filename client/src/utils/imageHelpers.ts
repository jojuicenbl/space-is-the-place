const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"

export const getSmallImageUrl = (url: string): string => {
  try {
    if (!url) {
      return "/default-cover.webp"
    }

    // Extract path after i.discogs.com
    const match = url.match(/i\.discogs\.com\/(.+)/)
    if (!match || !match[1]) {
      return "/default-cover.webp"
    }

    const discogsPath = match[1]
    const proxyUrl = `${API_URL}/api/proxy/images/${discogsPath}`

    return proxyUrl
  } catch (error) {
    console.error("Error processing image URL:", error)
    return "/default-cover.webp"
  }
}
