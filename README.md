
# mint-product-intel

RSSニュースから商品情報を抽出する実験プロジェクト

## 構成

- pages/api/news → RSS取得
- pages/api/extract → 商品解析
- lib/extractor → 抽出エンジン

## 目的

ニュース記事から
- ブランド
- 商品名
- カテゴリ

を自動抽出するプロトタイプ
