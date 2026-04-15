#!/bin/bash

echo "🧪 测试所有 ASIN 样例..."
echo ""

ASINS=(
  "B0BDJ7CWQV"
  "B09JQKJXVZ"
  "B08R68T84N"
  "B07QXV6N1B"
  "B08N5WRWNW"
  "B08KTZ8249"
  "B09B8V1LZ3"
  "B0CHWRXH8B"
  "B08C1W5N87"
  "B0D26F6FNN"
)

for asin in "${ASINS[@]}"; do
  echo "=== Testing $asin ==="
  result=$(curl -s "http://localhost:3001/api/analyze/$asin")
  conclusion=$(echo "$result" | jq -r '.conclusion')
  score=$(echo "$result" | jq -r '.overallScore')
  
  case $conclusion in
    "highly_recommended")
      echo "✅ 强烈推荐 - 评分: $score"
      ;;
    "recommended")
      echo "👍 推荐 - 评分: $score"
      ;;
    "neutral")
      echo "⚠️ 谨慎做 - 评分: $score"
      ;;
    "not_recommended")
      echo "❌ 不推荐 - 评分: $score"
      ;;
    *)
      echo "❓ 未知结论: $conclusion - 评分: $score"
      ;;
  esac
  echo ""
done

echo "✅ 测试完成！"
