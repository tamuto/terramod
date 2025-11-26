import { createFileRoute, Link } from '@tanstack/react-router'
import { Search, BookOpen, FileCode2, Sparkles } from 'lucide-react'
import { mockTemplates, mockUseCases } from '../data/mock-data'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              TerraMod - IaC Template & Use-case Hub
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              再利用性・学習性・柔軟なカスタマイズ性を実現する IaC プラットフォーム
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/templates">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  <FileCode2 className="mr-2 h-5 w-5" />
                  テンプレートを探す
                </Button>
              </Link>
              <Link to="/usecases">
                <Button size="lg" variant="secondary">
                  <BookOpen className="mr-2 h-5 w-5" />
                  事例を見る
                </Button>
              </Link>
              <Link to="/generate" className="relative inline-block">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Sparkles className="mr-2 h-5 w-5" />
                  AI で生成
                </Button>
                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400 text-xs px-2 py-0.5">PRO</Badge>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-8 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="search"
                placeholder="テンプレート、事例、タグで検索..."
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Templates Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">テンプレートカタログ</h2>
              <p className="text-gray-600 mt-2">最小構成の再利用可能なテンプレート</p>
            </div>
            <Link to="/templates">
              <Button variant="outline">すべて見る →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockTemplates.slice(0, 6).map((template) => (
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
        </section>

        {/* Use Cases Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">事例集</h2>
              <p className="text-gray-600 mt-2">実践的な組み合わせパターン</p>
            </div>
            <Link to="/usecases">
              <Button variant="outline">すべて見る →</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockUseCases.slice(0, 3).map((usecase) => (
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
        </section>
      </div>
    </div>
  )
}
