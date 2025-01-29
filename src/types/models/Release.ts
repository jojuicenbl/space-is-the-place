interface Artist {
  name: string
  id: number
  resource_url: string
  thumbnail_url?: string
}

interface Label {
  name: string
  catno: string
  entity_type: string
  entity_type_name: string
  id: number
  resource_url: string
  thumbnail_url?: string
}

interface Format {
  name: string
  qty: string
  descriptions: string[]
}

interface Track {
  position: string
  type_: string
  title: string
  duration: string
}

interface Image {
  type: "primary" | "secondary"
  uri: string
  resource_url: string
  uri150: string
  width: number
  height: number
}

interface BasicInformation {
  title: string
  year: number
  artists: Artist[]
  labels: Label[]
  formats: Format[]
  thumb: string
  cover_image: string
  tracklist?: Track[]
  images?: Image[]
}

export interface CollectionRelease {
  id: number
  basic_information: BasicInformation
  date_added: string
}

export interface CollectionResponse {
  releases: CollectionRelease[]
  pagination: {
    page: number
    pages: number
    items: number
    per_page: number
  }
}
