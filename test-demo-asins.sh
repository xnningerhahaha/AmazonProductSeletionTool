#!/bin/bash

echo "🧪 测试4个固定演示 ASIN..."
echo ""

ASINS=("B0DEMO0001" "B0DEMO0002" "B0DEMO0003" "B0DEMO0004")
EXPECTED=("强烈推荐" "推荐" "谨慎做" "不推荐")

for i in "${!ASINS[@]}"; do
  asin="${ASINS[$i]}"
  expected="${EXPECTED[$i]}"
  
  echo "=== 测试 $asin ==="
  echo "预期结论: $expected"
  
  result=$(curl -s "http://localhost:3001/api/analyze/$asin")
  conclusion=$(echo "$result" | jq -r '.conclusion')
  score=$(echo "$result" | jq -r '.overallScore')
  
  case $conclusion in
    "highly_recommended")
      actual="强烈推荐"
      icon="✅"
      ;;
    "recommended")
      actual="推荐"
      icon="👍"
      ;;
    "neutral")
      actual="谨慎做"
      icon="⚠️"
      ;;
    "not_recommended")
      actual="不推荐"
      icon="❌"
      ;;
    *)
      actual="未知"
      icon="❓"
      ;;
  esac
  
  echo "实际结论: $icon $actual - 评分: $score"
  
  if [ "$actual" == "$expected" ]; then
    echo "✅ 匹配成功！"
  else
    echo "❌ 不匹配！预期: $expected, 实际: $actual"
  fi
  
  echo ""
done

echo "✅ 测试完成！"
echo ""
echo "💡 提示："
echo "1. 所有4个演示 ASIN 应该返回固定的结论"
echo "2. B0DEMO0001 → 强烈推荐 (78-82分)"
echo "3. B0DEMO0002 → 推荐 (62-68分)"
echo "4. B0DEMO0003 → 谨慎做 (48-54分)"
echo "5. B0DEMO0004 → 不推荐 (25-35分)"
