#!/bin/bash
cd ~/AmazonProductSeletionTool/backend/dist

# Fix imports
for f in $(find . -name '*.js'); do
    sed -i 's|from "\.\./\([^"]*\)"|from "../\1.js"|g' "$f"
    sed -i "s|from '\.\./\([^']*\)'|from '../\1.js'|g" "$f"
    sed -i 's|from "\./\([^"]*\)"|from "./\1.js"|g' "$f"
    sed -i "s|from '\./\([^']*\)'|from './\1.js'|g" "$f"
done

# Fix double .js
find . -name '*.js' -exec sed -i 's|\.js\.js|.js|g' {} \;

echo "Imports fixed!"
