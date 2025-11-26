export interface Variable {
  name: string
  type: string
  description: string
  default?: string
  required: boolean
}

export interface Template {
  id: string
  name: string
  type: 'cdn' | 'compute' | 'network' | 'storage' | 'database' | 'api'
  category: string // CloudFront, API Gateway, VPC, S3, ECS, RDS など
  description: string
  tags: string[]
  readme: string
  variables: Variable[]
  code: string
  createdAt: string
  updatedAt: string
}

export interface UseCase {
  id: string
  name: string
  description: string
  templateIds: string[] // 使用するテンプレートのID
  tags: string[]
  readme: string
  code: string
  architecture?: string // Mermaid or PlantUML diagram
  createdAt: string
  updatedAt: string
}

export type SearchCategory = 'all' | 'component' | 'usecase' | 'tag'
