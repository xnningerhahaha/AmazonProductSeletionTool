#!/bin/bash

echo "Testing Backend API Integration"
echo "================================"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check"
echo "--------------------"
curl -s http://localhost:5000/health | jq '.' || echo "Backend not running or jq not installed"
echo ""
echo ""

# Test 2: Valid ASIN
echo "Test 2: Analyze with Valid ASIN (B08N5WRWNW)"
echo "---------------------------------------------"
curl -s -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"B08N5WRWNW"}' | jq '.' || echo "Backend not running or jq not installed"
echo ""
echo ""

# Test 3: Invalid ASIN Format
echo "Test 3: Analyze with Invalid ASIN (123)"
echo "----------------------------------------"
curl -s -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":"123"}' | jq '.' || echo "Backend not running or jq not installed"
echo ""
echo ""

# Test 4: Empty ASIN
echo "Test 4: Analyze with Empty ASIN"
echo "--------------------------------"
curl -s -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"asin":""}' | jq '.' || echo "Backend not running or jq not installed"
echo ""
echo ""

echo "================================"
echo "Testing Complete!"
echo ""
echo "Note: Make sure the backend server is running with 'npm run dev' in the backend directory"
