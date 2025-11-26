import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'
import { mockUseCases, getTemplateById } from '../../data/mock-data'
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

export const Route = createFileRoute('/usecases/')({
  component: UseCasesPage,
})

function UseCasesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredUseCases = useMemo(() => {
    return mockUseCases.filter((usecase) => {
      const matchesSearch =
        searchQuery === '' ||
        usecase.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usecase.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usecase.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )

      return matchesSearch
    })
  }, [searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">事例集</h1>
          <p className="text-gray-600 mb-6">
            実践的なインフラ構成の組み合わせパターン
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="事例名、説明、タグで検索..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Use Cases Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 text-gray-600">
          {filteredUseCases.length} 件の事例
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUseCases.map((usecase) => (
            <Link key={usecase.id} to={`/usecases/${usecase.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{usecase.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    {usecase.description}
                  </p>

                  <div className="space-y-2">
                    <div className="text-xs text-gray-500">
                      使用テンプレート: {usecase.templateIds.length}個
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {usecase.templateIds.slice(0, 3).map((templateId) => {
                        const template = getTemplateById(templateId)
                        return template ? (
                          <Badge
                            key={templateId}
                            variant="secondary"
                            className="text-xs"
                          >
                            {template.name}
                          </Badge>
                        ) : null
                      })}
                      {usecase.templateIds.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{usecase.templateIds.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex flex-wrap gap-2">
                    {usecase.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {usecase.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{usecase.tags.length - 4}
                      </Badge>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {filteredUseCases.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              該当する事例が見つかりませんでした
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSearchQuery('')}
            >
              検索をリセット
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
