#!/bin/bash
# Fix ESM imports by adding .js extension only to imports without it

cd ~/AmazonProductSeletionTool/backend/dist

# Fix imports that don't already have .js extension
# Match patterns like: from './module' or from '../module' but not from './module.js'
find . -name "*.js" -type f -exec sed -i \
  -e "s|from '\./\([^']*\)'\$|from './\1.js'|g" \
  -e 's|from "\.\/\([^"]*\)"$|from "./\1.js"|g' \
  -e "s|from '\.\./\([^']*\)'\$|from '../\1.js'|g" \
  -e 's|from "\.\.\/\([^"]*\)"$|from "../\1.js"|g' \
  {} \;

# Fix any double .js.js that might have been created
find . -name "*.js" -type f -exec sed -i 's/\.js\.js/.js/g' {} \;

echo "Imports fixed!"
