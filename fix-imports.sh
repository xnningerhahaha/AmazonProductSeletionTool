#!/bin/bash
# Fix ESM imports by adding .js extension

cd ~/AmazonProductSeletionTool/backend/dist

# Fix all imports in js files
find . -name "*.js" -type f -exec sed -i \
  -e "s|from '\./\([^']*\)'|from './\1.js'|g" \
  -e "s|from \"\./\([^\"]*\)\"|from \"./\1.js\"|g" \
  -e "s|from '\.\./\([^']*\)'|from '../\1.js'|g" \
  -e "s|from \"\.\./\([^\"]*\)\"|from \"../\1.js\"|g" \
  {} \;

echo "Imports fixed!"
