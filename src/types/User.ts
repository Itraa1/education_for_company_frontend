export interface User {
  blocked: boolean
  confirmed: boolean
  createdAt: string
  documentId: string
  email: string
  id: number
  provider: string
  publishedAt: string
  role: Role
}

interface Role {
  createdAt: string
  description: string
  documentId: string
  id: 4
  name: string
  publishedAt: string
  type: string
  updatedAt: string
}

