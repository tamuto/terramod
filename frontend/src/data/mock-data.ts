import { mockTemplates } from './mock-templates'
import { mockUseCases } from './mock-usecases'

export { mockTemplates, mockUseCases }

// ヘルパー関数
export const getTemplateById = (id: string) => {
  return mockTemplates.find((t) => t.id === id)
}

export const getUseCaseById = (id: string) => {
  return mockUseCases.find((u) => u.id === id)
}

export const getTemplatesByType = (type: string) => {
  return mockTemplates.filter((t) => t.type === type)
}

export const getTemplatesByTag = (tag: string) => {
  return mockTemplates.filter((t) => t.tags.includes(tag))
}

export const getUseCasesByTag = (tag: string) => {
  return mockUseCases.filter((u) => u.tags.includes(tag))
}

export const searchTemplates = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return mockTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.category.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export const searchUseCases = (query: string) => {
  const lowerQuery = query.toLowerCase()
  return mockUseCases.filter(
    (u) =>
      u.name.toLowerCase().includes(lowerQuery) ||
      u.description.toLowerCase().includes(lowerQuery) ||
      u.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)),
  )
}

export const getAllTags = () => {
  const templateTags = mockTemplates.flatMap((t) => t.tags)
  const useCaseTags = mockUseCases.flatMap((u) => u.tags)
  return [...new Set([...templateTags, ...useCaseTags])].sort()
}

export const getTemplateCategories = () => {
  return [...new Set(mockTemplates.map((t) => t.category))].sort()
}
