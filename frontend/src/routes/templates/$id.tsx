import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Copy, Download, FileCode2, Sparkles } from 'lucide-react'
import { getTemplateById } from '../../data/mock-data'
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

export const Route = createFileRoute('/templates/$id')({
  component: TemplateDetailPage,
  loader: ({ params }) => {
    const template = getTemplateById(params.id)
    if (!template) {
      throw notFound()
    }
    return { template }
  },
})

function TemplateDetailPage() {
  const { template } = Route.useLoaderData()

  const handleCopyCode = () => {
    navigator.clipboard.writeText(template.code)
  }

  const handleDownload = () => {
    const blob = new Blob([template.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template.id}.tf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link to="/templates" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            テンプレート一覧に戻る
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">
                  {template.name}
                </h1>
                <Badge variant="secondary" className="text-sm">
                  {template.type}
                </Badge>
              </div>
              <p className="text-gray-600 text-lg mb-4">{template.category}</p>
              <p className="text-gray-700">{template.description}</p>
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
            {template.tags.map((tag) => (
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
                <TabsTrigger value="code">
                  <FileCode2 className="h-4 w-4 mr-2" />
                  コード
                </TabsTrigger>
                <TabsTrigger value="readme">README</TabsTrigger>
                <TabsTrigger value="variables">変数</TabsTrigger>
              </TabsList>

              <TabsContent value="code">
                <Card>
                  <CardHeader>
                    <CardTitle>IaCコード</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <code>{template.code}</code>
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
                        {template.readme}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variables">
                <Card>
                  <CardHeader>
                    <CardTitle>変数一覧</CardTitle>
                    <CardDescription>
                      このテンプレートで使用できる変数
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {template.variables.map((variable) => (
                        <div
                          key={variable.name}
                          className="border-b pb-4 last:border-b-0"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                              {variable.name}
                            </code>
                            <Badge variant="outline" className="text-xs">
                              {variable.type}
                            </Badge>
                            {variable.required && (
                              <Badge variant="destructive" className="text-xs">
                                必須
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {variable.description}
                          </p>
                          {variable.default && (
                            <p className="text-xs text-gray-500 mt-1">
                              デフォルト値: <code>{variable.default}</code>
                            </p>
                          )}
                        </div>
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
                <CardTitle>テンプレート情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600 mb-1">ID</div>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {template.id}
                  </code>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">カテゴリ</div>
                  <div className="font-medium">{template.category}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">タイプ</div>
                  <Badge variant="secondary">{template.type}</Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">変数数</div>
                  <div className="font-medium">{template.variables.length}個</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">作成日</div>
                  <div className="text-sm">
                    {new Date(template.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">更新日</div>
                  <div className="text-sm">
                    {new Date(template.updatedAt).toLocaleDateString('ja-JP')}
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
