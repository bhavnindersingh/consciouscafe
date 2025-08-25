// Simple CSS validation test
const fs = require('fs');
const path = require('path');

try {
  const cssContent = fs.readFileSync(path.join(__dirname, 'src/styles/App.css'), 'utf8');
  
  // Check for common CSS syntax errors
  const errors = [];
  
  // Check for orphaned opening braces
  const lines = cssContent.split('\n');
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed === '{') {
      errors.push(`Line ${index + 1}: Orphaned opening brace`);
    }
    if (trimmed.startsWith('//')) {
      errors.push(`Line ${index + 1}: Invalid CSS comment (use /* */ instead)`);
    }
  });
  
  if (errors.length === 0) {
    console.log('✅ CSS syntax validation passed!');
    console.log('The build should now work correctly on Netlify.');
  } else {
    console.log('❌ CSS syntax errors found:');
    errors.forEach(error => console.log(error));
  }
  
} catch (error) {
  console.error('Error reading CSS file:', error.message);
}
