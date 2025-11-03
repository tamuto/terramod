# Terramod

* 旧ファイル群は _legacy/ ディレクトリに移動しました。参照している場合には、適宜パスを修正してください。

Terraform関連ツール群

## プロジェクト構成

```
terramod/
├── packages/
│   └── tools/          # Terraform Provider schema to YAML converter
├── etc/
│   └── terraform/      # Terraform configuration
└── output/             # Generated YAML files (gitignored)
```

## Tools

### terramod-schema

Terraform Providerのスキーマとドキュメントを多言語対応のYAML形式に変換するツール

詳細は [packages/tools/README.md](packages/tools/README.md) を参照してください。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は [LICENSE](LICENSE) を参照してください。

### データソース

このプロジェクトは以下のソースからデータを取得・処理します：

- **Terraform Provider Documentation**: © HashiCorp, Inc. (MPL 2.0)
- **Terraform Provider Schema**: Terraform CLI経由で生成

## 免責事項

このツールはHashiCorp, Inc.とは無関係の非公式ツールです。
TerraformおよびTerraformロゴはHashiCorp, Inc.の商標です。
