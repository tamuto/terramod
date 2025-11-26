import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Sparkles, Send, Copy, Download, Plus, X } from 'lucide-react'
import { mockTemplates, mockUseCases } from '../data/mock-data'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

export const Route = createFileRoute('/generate')({
  component: GeneratePage,
})

function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([])
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    // モックの生成処理（実際にはバックエンドAPIを呼び出す）
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockGeneratedCode = `# AI Generated Infrastructure Configuration
# Prompt: ${prompt}
# Selected Templates: ${selectedTemplates.join(', ')}
# Selected Use Cases: ${selectedUseCases.join(', ')}

resource "example_resource" "generated" {
  # Generated configuration based on your requirements
  name = "generated-resource"

  # Add your custom configuration here
}

# Additional resources will be generated based on your prompt
`
    setGeneratedCode(mockGeneratedCode)
    setIsGenerating(false)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'generated.tf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const toggleTemplate = (id: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    )
  }

  const toggleUseCase = (id: string) => {
    setSelectedUseCases((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id],
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-10 w-10" />
            <h1 className="text-4xl font-bold">AI カスタマイズ生成</h1>
          </div>
          <p className="text-xl text-purple-100">
            自然言語でインフラ構成を生成します
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <Card>
              <CardHeader>
                <CardTitle>要件を入力</CardTitle>
                <CardDescription>
                  自然言語で構成の要件を記述してください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="例: CloudFront basic にカスタムドメイン追加して。Route53 は zone_id ある前提で"
                    className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">例文:</p>
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        setPrompt(
                          'CloudFront basic にカスタムドメイン追加して。Route53 は zone_id ある前提で',
                        )
                      }
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      CloudFront + カスタムドメイン
                    </button>
                    <button
                      onClick={() =>
                        setPrompt(
                          'この 2 つの事例をマージして、社内用 private CDN にして',
                        )
                      }
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      事例マージ
                    </button>
                    <button
                      onClick={() =>
                        setPrompt(
                          'このテンプレに KMS 暗号化追加して、環境変数も整えて',
                        )
                      }
                      className="text-sm text-blue-600 hover:underline block"
                    >
                      KMS暗号化追加
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full relative"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      生成する
                      <Badge className="ml-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-400">PRO</Badge>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Code */}
            {generatedCode && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>生成されたコード</CardTitle>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={handleCopyCode}>
                        <Copy className="h-4 w-4 mr-1" />
                        コピー
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        ダウンロード
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Selection Sidebar */}
          <div className="space-y-6">
            {/* Selected Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  テンプレートを選択
                  {selectedTemplates.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedTemplates.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  ベースとなるテンプレートを選択（任意）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockTemplates.slice(0, 8).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => toggleTemplate(template.id)}
                      className={`w-full text-left p-2 rounded border transition-colors ${
                        selectedTemplates.includes(template.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{template.name}</div>
                        {selectedTemplates.includes(template.id) ? (
                          <X className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.category}
                      </div>
                    </button>
                  ))}
                </div>
                <Link to="/templates" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    すべてのテンプレートを見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Selected Use Cases */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  事例を選択
                  {selectedUseCases.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedUseCases.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  参考にする事例を選択（任意）
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockUseCases.slice(0, 5).map((usecase) => (
                    <button
                      key={usecase.id}
                      onClick={() => toggleUseCase(usecase.id)}
                      className={`w-full text-left p-2 rounded border transition-colors ${
                        selectedUseCases.includes(usecase.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">{usecase.name}</div>
                        {selectedUseCases.includes(usecase.id) ? (
                          <X className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Plus className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {usecase.tags.slice(0, 2).join(', ')}
                      </div>
                    </button>
                  ))}
                </div>
                <Link to="/usecases" className="block mt-3">
                  <Button variant="outline" size="sm" className="w-full">
                    すべての事例を見る
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 具体的に要件を記述してください</li>
                  <li>• テンプレートや事例を選択すると精度が向上します</li>
                  <li>• 変数名や既存リソースIDも指定できます</li>
                  <li>• 生成後にさらにカスタマイズできます</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
