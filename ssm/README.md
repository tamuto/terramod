# SSMの設定

## 設定されるもの

* EC2向けSSMロールの設定（およびロールへのアタッチまで）
* endpointの作成
  * ssm, ssmmessage, ec2messageの3種類
  * defaultのsecurity groupへ紐つける

## 手動で設定が必要なもの

* IAMユーザが実際にアクセスするためのSwitchRole先のロール生成
* 以下の定義を持ったポリシー

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ssm:StartSession",
            "Resource": [
                "arn:aws:ec2:*:294515681822:instance/*",
                "arn:aws:ssm:*:294515681822:document/AWS-StartSSHSession"
            ],
            "Condition": {
                "BoolIfExists": {
                    "ssm:SessionDocumentAccessCheck": "true"
                }
            }
        }
    ]
}
```
