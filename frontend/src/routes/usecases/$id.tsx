import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Copy, Download, Network, Sparkles } from 'lucide-react'
import { getUseCaseById, getTemplateById } from '../../data/mock-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export const Route = createFileRoute('/usecases/$id')({
  component: UseCaseDetailPage,
  loader: ({ params }) => {
    const usecase = getUseCaseById(params.id)
    if (!usecase) {
      throw notFound()
    }
    return { usecase }
  },
})

function UseCaseDetailPage() {
  const { usecase } = Route.useLoaderData()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(usecase.code)
  }

  const handleDownload = () => {
    const blob = new Blob([usecase.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${usecase.id}.tf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const templates = usecase.templateIds
    .map((id) => getTemplateById(id))
    .filter((t) => t !== undefined)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/usecases"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            事例一覧に戻る
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {usecase.name}
              </h1>
              <p className="text-gray-700 mb-4">{usecase.description}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCopyCode}>
                <Copy className="h-4 w-4 mr-2" />
                コピー
              </Button>
              <Button variant="secondary" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                ダウンロード
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {usecase.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="code">コード</TabsTrigger>
                <TabsTrigger value="readme">README</TabsTrigger>
                {usecase.architecture && (
                  <TabsTrigger value="architecture">
                    <Network className="h-4 w-4 mr-2" />
                    アーキテクチャ
                  </TabsTrigger>
                )}
                <TabsTrigger value="templates">使用テンプレート</TabsTrigger>
              </TabsList>

              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle>IaCコード</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{usecase.code}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="readme">
                <Card>
                  <CardHeader>
                    <CardTitle>README</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">
                        {usecase.readme}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {usecase.architecture && (
                <TabsContent value="architecture">
                  <Card>
                    <CardHeader>
                      <CardTitle>アーキテクチャ図</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white p-4 rounded border">
                        <pre className="text-sm">{usecase.architecture}</pre>
                        <p className="text-xs text-gray-500 mt-4">
                          ※ Mermaid形式のダイアグラムコード
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              <TabsContent value="templates">
                <Card>
                  <CardHeader>
                    <CardTitle>使用テンプレート</CardTitle>
                    <CardDescription>
                      この事例で使用されているテンプレート一覧
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {templates.map((template) => (
                        <Link
                          key={template.id}
                          to={`/templates/${template.id}`}
                          className="block"
                        >
                          <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">
                                    {template.name}
                                  </h3>
                                  <Badge variant="secondary" className="text-xs">
                                    {template.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {template.description}
                                </p>
                              </div>
                              <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>事例情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">ID</div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {usecase.id}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    使用テンプレート数
                  </div>
                  <div className="font-medium">
                    {usecase.templateIds.length}個
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">作成日</div>
                  <div className="text-sm">
                    {new Date(usecase.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">更新日</div>
                  <div className="text-sm">
                    {new Date(usecase.updatedAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>使用方法</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>コードをコピーまたはダウンロード</li>
                  <li>使用テンプレートを確認</li>
                  <li>プロジェクトに配置</li>
                  <li>必要な変数を設定</li>
                  <li>terraform apply で適用</li>
                </ol>
              </CardContent>
            </Card>

            <Link to="/generate">
              <Button className="w-full" variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                AIでカスタマイズ
                <Badge className="ml-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">PRO</Badge>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
