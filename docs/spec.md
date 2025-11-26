# プロジェクト名（仮）
Terraform Template & Use-case Hub with LLM Support

# コンセプト
Terraform 構築に必要なテンプレート、実践的な事例集、さらに LLM によるカスタマイズ生成を組み合わせ、
「再利用性」「学習性」「柔軟なカスタマイズ性」を同時に満たす IaC Hub を構築する。

従来の Terraform Module の汎用化問題や複雑化、互換性維持の負担を解消し、
LLM 時代に最適化された「薄いテンプレート」＋「豊富な事例」＋「AI による最適化」の組み合わせによる新しい運用スタイルを提供する。

# システム概要
- Terraform の基本テンプレートを最小構成で提供する（CloudFront / API Gateway / VPC / ECS / S3 / RDS など）
- テンプレートは1コンポーネントにつき1つを原則とし、過度な汎用化は行わない（薄いテンプレ化）
- 各テンプレートに対して、実際の利用シナリオを示す「事例集（use-case examples）」を多数収集・提供
- ユーザーは LLM を使ってテンプレートを拡張・合成・修正できる（例：CloudFront + WAF + Custom domain）
- 事例は LLM の回答精度向上にも利用される（学習素材として活用）
- テンプレートと事例から最適な構成を自動生成する AI インタラクション UI を提供

# 主な機能
1. **テンプレートカタログ**
   - CloudFront（基本構成）
   - API Gateway（基本構成）
   - VPC（最小 / マルチAZ）
   - S3（private / static website）
   - ECS（最小サービス / ALB付き）
   - RDS（dev / production）
   - その他 AWS コンポーネントの基本テンプレート
   - 各テンプレートは README & 変数の説明付き

2. **事例集（use-case library）**
   - CloudFront + カスタムドメイン
   - CloudFront + WAF
   - CloudFront + S3 + OAC
   - API Gateway + Lambda + Custom Domain
   - ECS + VPC + ALB
   - RDS + Enhanced Monitoring
   - など、実務的な組み合わせ例を蓄積

3. **LLM による Terraform カスタマイズ生成**
   - ユーザーが自然言語で依頼することで、テンプレートや事例から構成を自動生成
   - 例：「CloudFront basic にカスタムドメイン追加して。Route53 は zone_id ある前提で」
   - 例：「この 2 つの事例をマージして、社内用 private CDN にして」
   - 例：「このテンプレに KMS 暗号化追加して、環境変数も整えて」

4. **構成の自動ドキュメント化**
   - LLM による README の自動生成
   - アーキテクチャ図の自動生成（Mermaid / PlantUML）

5. **テンプレート拡張の支援**
   - 事例から共通パターンを抽出し、新しいテンプレとして昇格させるワークフロー
   - LLM によるテンプレの品質改善提案（リファクタリング / セキュリティ改善）

6. **検索 UI**
   - コンポーネント検索（CloudFront / VPC / ECS…）
   - ユースケース検索（静的サイト配信 / API 配布 / Private backend）
   - タグ検索（security / performance / cost-optimized / minimal）

7. **ダウンロード / コピー機能**
   - 個別テンプレートを ZIP or Git snippetとして取得
   - 事例を丸ごとコピーして自分の Terraform プロジェクトへ反映
   - 「組み合わせ済み構成」をそのまま出力

# アーキテクチャ思想
- テンプレートは最小構成（“薄い module の原則”）
- カスタマイズは LLM に任せる
- 事例集を充実させ、LLM の変換精度を高める
- 相互依存を避け、テンプレ更新の負担を最小化
- ベストプラクティスはテンプレではなく “事例集” に蓄積する
- 利用者は必要な構成を LLM に組み立ててもらう

# 価値
- module の汎用化・複雑化問題を根本的に解決
- テンプレの作成・メンテナンスコストを大幅削減
- 実務的な構成パターンを事例として整理し学習効果UP
- LLM による柔軟なカスタマイズ生成を可能にする
- Terraform 初心者〜上級者まで利用価値が高い
- クラウド構成の学習教材としても強い

# 将来拡張案
- ユーザー自身による事例投稿機能
- 事例のレコメンドエンジン
- LLM による自動コードレビュー
- Terraform 以外への拡張（CDK / Pulumi / serverless）
- AI による“構築済み AWS 環境の Terraform 逆生成（インポート＋補完）”
