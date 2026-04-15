#!/bin/bash

echo "🧪 测试改进效果..."
echo ""

# 测试 B0BDJ7CWQV (应该是"谨慎做")
echo "📦 测试 ASIN: B0BDJ7CWQV"
echo "预期结果: 谨慎做 (综合评分 45-58)"
echo ""

curl -s http://localhost:3001/api/analyze/B0BDJ7CWQV | jq '{
  conclusion: .conclusion,
  overallScore: .overallScore,
  recommendations: .recommendations
}'

echo ""
echo "---"
echo ""

# 测试默认 ASIN (应该是"推荐")
echo "📦 测试 ASIN: B08N5WRWNW (默认)"
echo "预期结果: 推荐 (综合评分 60-72)"
echo ""

curl -s http://localhost:3001/api/analyze/B08N5WRWNW | jq '{
  conclusion: .conclusion,
  overallScore: .overallScore,
  recommendations: .recommendations
}'

echo ""
echo "✅ 测试完成！"
echo ""
echo "💡 提示："
echo "1. 专业建议应该显示在 9 个维度上方"
echo "2. 结论应该显示为'谨慎做'而不是'中性'"
echo "3. B0BDJ7CWQV 应该是'谨慎做'，不是'强烈推荐'"
