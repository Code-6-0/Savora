const fs = require('fs');

function cleanTypeScript(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Remove }: { ... } blocks (TypeScript parameter types)
  // Match closing brace of destructuring, colon, then type definition block
  // Use non-greedy match and handle nested braces
  let prevContent;
  do {
    prevContent = content;
    content = content.replace(/\}\s*:\s*\{[\s\S]*?\n\}\s*\)\s*\{/g, '}) {');
  } while (content !== prevContent);
  
  // Remove 'as Type[]' and 'as Type' casts
  content = content.replace(/\s+as\s+\w+\[\]/g, '');
  content = content.replace(/\s+as\s+\w+/g, '');
  
  // Remove generic types from useState: useState<Type>
  content = content.replace(/useState<[^>]+>/g, 'useState');
  
  // Remove generic types from function declarations
  content = content.replace(/function\s+(\w+)<[^>]+>\(/g, 'function $1(');
  
  // Remove union types from parameters: param| type
  content = content.replace(/(\w+)\|\s*null/g, '$1');
  content = content.replace(/(\w+)\|\s*\w+/g, '$1');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Cleaned: ${filePath}`);
  } else {
    console.log(`- No changes: ${filePath}`);
  }
}

const files = [
  'src/app/produk/tambah/page.js',
  'src/app/marketplace/page.js',
  'src/components/organisms/Sidebar.js'
];

files.forEach(file => cleanTypeScript(file));
console.log('Done!');
