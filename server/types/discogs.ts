export interface DiscogsArtist {
  name: string
  id: number
  resource_url: string
  thumbnail_url?: string
}

export interface DiscogsImage {
  type: string
  uri: string
  resource_url: string
  uri150: string
  width: number
  height: number
}

export interface DiscogsBasicInformation {
  id: number
  master_id: number
  master_url: string
  resource_url: string
  title: string
  year: number
  artists: DiscogsArtist[]
  labels: Array<{
    name: string
    catno: string
    entity_type: string
    entity_type_name: string
    id: number
    resource_url: string
  }>
  genres: string[]
  styles?: string[]
  thumb: string
  cover_image: string
  formats: Array<{
    name: string
    qty: string
    text?: string
    descriptions: string[]
  }>
}

export interface DiscogsCollectionRelease {
  id: number
  instance_id: number
  date_added: string
  basic_information: DiscogsBasicInformation
  folder_id: number
  rating: number
}

export interface DiscogsPagination {
  page: number
  pages: number
  per_page: number
  items: number
  urls: {
    last?: string
    next?: string
    prev?: string
    first?: string
  }
}

export interface DiscogsCollectionResponse {
  pagination: DiscogsPagination
  releases: DiscogsCollectionRelease[]
}

export interface DiscogsFolder {
  id: number
  name: string
  count: number
  resource_url: string
}

export interface DiscogsFoldersResponse {
  folders: DiscogsFolder[]
}

export type SortField = 'added' | 'artist' | 'title' | 'year'
export type SortOrder = 'asc' | 'desc'

export interface CollectionFilters {
  page?: number
  perPage?: number
  folderId?: number
  sort?: SortField
  sortOrder?: SortOrder
  search?: string
} 