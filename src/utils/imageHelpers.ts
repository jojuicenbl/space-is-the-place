export const getSmallImageUrl = (url: string) => {
  try {
    // replace the Discogs domain with my proxy
    return url.replace("https://i.discogs.com", "/discogs-images")
  } catch {
    return url
  }
}
