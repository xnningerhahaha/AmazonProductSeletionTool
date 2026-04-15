#!/bin/bash

echo "🧪 Testing API..."
echo ""

response=$(curl -s -X POST http://localhost:5001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08N5WRWNW"}')

# Check if response contains success
if echo "$response" | grep -q '"success":true'; then
  echo "✅ API test PASSED!"
  echo ""
  echo "Response preview:"
  echo "$response" | python3 -c "import sys, json; data=json.load(sys.stdin); print('Conclusion:', data['data']['analysis']['conclusion']); print('Score:', data['data']['analysis']['overallScore']); print('Dimensions:', len(data['data']['analysis']['dimensions']), 'dimensions')" 2>/dev/null || echo "$response" | head -c 200
else
  echo "❌ API test FAILED!"
  echo ""
  echo "Error response:"
  echo "$response"
fi

echo ""
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
