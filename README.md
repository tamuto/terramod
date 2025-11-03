# Terramod

* 旧ファイル群は _legacy/ ディレクトリに移動しました。参照している場合には、適宜パスを修正してください。

Terraform関連ツール群

## プロジェクト構成

```
terramod/
├── packages/
│   └── terramod-schema/  # Terraform Provider schema to YAML converter
├── etc/
│   └── terraform/      # Terraform configuration
└── output/             # Generated YAML files (gitignored)
```

## クイックスタート

このプロジェクトは [uv](https://docs.astral.sh/uv/) と [taskipy](https://github.com/taskipy/taskipy) を使用しています。

### タスクランナー（taskipy）

プロジェクトルートから簡単にコマンドを実行できます：

```bash
# タスク一覧を表示
uv run task --list

# 設定情報を表示
uv run task info

# プロバイダードキュメントをダウンロード
uv run task download

# YAMLスキーマファイルを生成（Markdown enrichment付き）
uv run task generate

# フルプロセス実行（download + generate）
uv run task full

# 生成されたYAMLファイルをクリーンアップ
uv run task clean
```

### 利用可能なタスク

| タスク | 説明 |
|--------|------|
| `info` | terramod-schema の設定情報を表示 |
| `download` | Terraform Registry からプロバイダードキュメントをダウンロード |
| `generate` | YAML スキーマファイルを生成（Markdown enrichment 付き） |
| `full` | フルプロセスを実行（download + generate） |
| `clean` | 生成された YAML ファイルを削除 |

**注意**: `generate` タスクは自動的に `--with-markdown` フラグを使用します。これにより、`possible_values` と `default_value` がMarkdownドキュメントから抽出されます。

## Tools

### terramod-schema

Terraform Providerのスキーマとドキュメントを多言語対応のYAML形式に変換するツール

詳細は [packages/terramod-schema/README.md](packages/terramod-schema/README.md) を参照してください。

直接実行する場合：

```bash
# プロジェクトルートから
uv run --directory packages/terramod-schema terramod-schema <command>

# packages/terramod-schema ディレクトリ内で
cd packages/terramod-schema
uv run terramod-schema <command>
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) を参照してください。

### データソース

このプロジェクトは以下のソースからデータを取得・処理します：

- **Terraform Provider Documentation**: © HashiCorp, Inc. (MPL 2.0)
- **Terraform Provider Schema**: Terraform CLI経由で生成

## 免責事項

このツールはHashiCorp, Inc.とは無関係の非公式ツールです。
TerraformおよびTerraformロゴはHashiCorp, Inc.の商標です。
