#!/bin/bash

echo "🧪 测试 B0DEMO0001 - 应该是强烈推荐"
echo ""

result=$(curl -s "http://localhost:3001/api/analyze/B0DEMO0001")

conclusion=$(echo "$result" | jq -r '.conclusion')
score=$(echo "$result" | jq -r '.overallScore')
monopolyScore=$(echo "$result" | jq -r '.dimensions.monopoly.score')

echo "综合评分: $score"
echo "头部垄断度评分: $monopolyScore"
echo ""

case $conclusion in
  "highly_recommended")
    echo "✅ 结论: 强烈推荐"
    echo "✅ 测试通过！"
    ;;
  "recommended")
    echo "👍 结论: 推荐"
    echo "❌ 测试失败！应该是强烈推荐"
    echo ""
    echo "需要满足的条件:"
    echo "- 综合评分 ≥ 75 分 (当前: $score)"
    echo "- 头部垄断度 ≥ 60 分 (当前: $monopolyScore)"
    ;;
  "neutral")
    echo "⚠️ 结论: 谨慎做"
    echo "❌ 测试失败！应该是强烈推荐"
    ;;
  "not_recommended")
    echo "❌ 结论: 不推荐"
    echo "❌ 测试失败！应该是强烈推荐"
    ;;
  *)
    echo "❓ 未知结论: $conclusion"
    ;;
esac

echo ""
echo "详细维度评分:"
echo "$result" | jq '.dimensions | to_entries | map({name: .key, score: .value.score}) | .[]'
