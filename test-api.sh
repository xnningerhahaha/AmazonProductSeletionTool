#!/bin/bash

echo "Testing Amazon Product Analyzer API..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:5001/health | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))"
echo ""
echo ""

# Test analyze endpoint
echo "2. Testing analyze endpoint with ASIN: B08N5WRWNW..."
curl -s -X POST http://localhost:5001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08N5WRWNW"}' \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(json.dumps(data, indent=2, ensure_ascii=False))" \
  | head -200

echo ""
echo "✅ API test completed!"
