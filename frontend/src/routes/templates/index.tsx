import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { mockTemplates, getTemplateCategories } from '../../data/mock-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

export const Route = createFileRoute('/templates/')({
  component: TemplatesPage,
})

function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = getTemplateCategories()
  const types = ['all', 'cdn', 'compute', 'network', 'storage', 'database', 'api']

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter((template) => {
      const matchesSearch =
        searchQuery === '' ||
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )

      const matchesType = selectedType === 'all' || template.type === selectedType
      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory

      return matchesSearch && matchesType && matchesCategory
    })
  }, [searchQuery, selectedType, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            テンプレートカタログ
          </h1>
          <p className="text-gray-600 mb-6">
            最小構成の再利用可能なIaCテンプレート
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="テンプレート名、説明、タグで検索..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter className="inline h-4 w-4 mr-1" />
                タイプ
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedType === type ? 'default' : 'outline'}
                    onClick={() => setSelectedType(type)}
                  >
                    {type === 'all' ? 'すべて' : type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                <Filter className="inline h-4 w-4 mr-1" />
                カテゴリ
              </label>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                >
                  すべて
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 text-gray-600">
          {filteredTemplates.length} 件のテンプレート
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Link key={template.id} to={`/templates/${template.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{template.name}</CardTitle>
                    <Badge variant="secondary">{template.type}</Badge>
                  </div>
                  <CardDescription>{template.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {template.description}
                  </p>
                  <div className="mt-4 text-xs text-gray-500">
                    変数: {template.variables.length}個
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              該当するテンプレートが見つかりませんでした
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setSelectedType('all')
                setSelectedCategory('all')
              }}
            >
              フィルターをリセット
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
