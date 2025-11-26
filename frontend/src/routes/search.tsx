import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { Search, Filter, FileCode2, BookOpen } from 'lucide-react'
import {
  mockTemplates,
  mockUseCases,
  searchTemplates,
  searchUseCases,
  getAllTags,
} from '../data/mock-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'

export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || '',
      category: (search.category as string) || 'all',
    }
  },
})

function SearchPage() {
  const navigate = useNavigate()
  const { q, category } = Route.useSearch()
  const [query, setQuery] = useState(q)
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = getAllTags()

  const handleSearch = () => {
    navigate({
      to: '/search',
      search: { q: query, category: selectedCategory },
    })
  }

  const filteredTemplates = useMemo(() => {
    let results = query ? searchTemplates(query) : mockTemplates

    if (selectedTags.length > 0) {
      results = results.filter((t) =>
        selectedTags.some((tag) => t.tags.includes(tag)),
      )
    }

    return results
  }, [query, selectedTags])

  const filteredUseCases = useMemo(() => {
    let results = query ? searchUseCases(query) : mockUseCases

    if (selectedTags.length > 0) {
      results = results.filter((u) =>
        selectedTags.some((tag) => u.tags.includes(tag)),
      )
    }

    return results
  }, [query, selectedTags])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const totalResults = filteredTemplates.length + filteredUseCases.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">検索</h1>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="search"
              placeholder="テンプレート、事例、タグで検索..."
              className="pl-10 h-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={handleSearch}
            >
              検索
            </Button>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              <Filter className="inline h-4 w-4 mr-1" />
              タグでフィルター
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 15).map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setSelectedTags([])}
              >
                フィルターをクリア
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4 text-gray-600">
          {query && (
            <>
              「<span className="font-semibold">{query}</span>」の検索結果:{' '}
            </>
          )}
          {totalResults} 件
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">
              すべて ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileCode2 className="h-4 w-4 mr-2" />
              テンプレート ({filteredTemplates.length})
            </TabsTrigger>
            <TabsTrigger value="usecases">
              <BookOpen className="h-4 w-4 mr-2" />
              事例 ({filteredUseCases.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {/* Templates */}
            {filteredTemplates.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">テンプレート</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTemplates.slice(0, 6).map((template) => (
                    <Link key={template.id} to={`/templates/${template.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-xl">
                              {template.name}
                            </CardTitle>
                            <Badge variant="secondary">{template.type}</Badge>
                          </div>
                          <CardDescription>{template.category}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <div className="flex flex-wrap gap-2">
                            {template.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
                {filteredTemplates.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link to="/templates">
                      <Button variant="outline">
                        すべてのテンプレートを見る →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Use Cases */}
            {filteredUseCases.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">事例</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUseCases.slice(0, 6).map((usecase) => (
                    <Link key={usecase.id} to={`/usecases/${usecase.id}`}>
                      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-xl">{usecase.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600 mb-4">
                            {usecase.description}
                          </p>
                          <div className="text-xs text-gray-500">
                            使用テンプレート: {usecase.templateIds.length}個
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="flex flex-wrap gap-2">
                            {usecase.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
                {filteredUseCases.length > 6 && (
                  <div className="mt-4 text-center">
                    <Link to="/usecases">
                      <Button variant="outline">すべての事例を見る →</Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {totalResults === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">
                  検索結果が見つかりませんでした
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('')
                    setSelectedTags([])
                  }}
                >
                  検索をリセット
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
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
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {template.description}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">該当するテンプレートがありません</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="usecases" className="mt-6">
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
                      <div className="text-xs text-gray-500">
                        使用テンプレート: {usecase.templateIds.length}個
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex flex-wrap gap-2">
                        {usecase.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
            {filteredUseCases.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">該当する事例がありません</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
