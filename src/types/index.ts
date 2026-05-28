export interface PortfolioItem {
  id: string
  title: string
  description?: string | null
  imageUrl: string
  category: string
  featured: boolean
  createdAt: Date
}

export interface Service {
  id: string
  title: string
  description: string
  price: string
  features: string[]
  popular: boolean
  createdAt: Date
}

export interface Inquiry {
  id: string
  name: string
  email: string
  phone?: string
  eventDate?: string
  message: string
  status: string
  createdAt: Date
}

export interface Testimonial {
  id: string
  clientName: string
  rating: number
  review: string
  imageUrl?: string | null
  type: string
  extraData?: string | null
  approved: boolean
  createdAt: Date
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface SiteAsset {
  id: string
  key: string
  imageUrl: string
  altText?: string | null
  createdAt: Date
  updatedAt: Date
}
