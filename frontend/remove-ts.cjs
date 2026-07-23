const fs = require('fs');
const path = require('path');

function removeTypeScriptAnnotations(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove type annotations from function parameters: }: { ... }
  // More aggressive pattern to catch all variants
  content = content.replace(/\n\}\s*:\s*\{[\s\S]*?\n\}\s*\)/g, '\n})');
  content = content.replace(/\n\}\s*:\s*\{[\s\S]*?\n\}/g, '\n}');
  
  // Remove TypeScript generics from functions: function name<T>(...) => function name(...)
  content = content.replace(/function\s+(\w+)<[^>]+>\s*\(/g, 'function $1(');
  
  // Remove TypeScript generics from useState: useState<Type> => useState
  content = content.replace(/useState<[^>]+>/g, 'useState');
  
  // Remove 'as Type' casts but keep the expression
  content = content.replace(/\s+as\s+\w+(\[\])?/g, '');
  
  // Remove type annotations from function params like: param| type
  content = content.replace(/(\w+)\|\s*null,/g, '$1,');
  content = content.replace(/(\w+)\|\s*null\)/g, '$1)');
  
  // Remove JSDoc union types: @param {type|type}
  content = content.replace(/@param\s+\{([^}|]+)\|([^}]+)\}/g, '@param {$1}');
  content = content.replace(/@returns\s+\{([^}|]+)\|([^}]+)\}/g, '@returns {$1}');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned: ${filePath}`);
}

const files = [
  'src/app/produk/tambah/page.js',
  'src/app/marketplace/page.js',
  'src/components/organisms/Sidebar.js'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    removeTypeScriptAnnotations(fullPath);
  }
});

console.log('Done!');
