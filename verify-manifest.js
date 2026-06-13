import fs from 'fs';
import path from 'path';

// ANSI escape codes for nice visual output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

console.log(`${BOLD}${BLUE}====================================================${RESET}`);
console.log(`${BOLD}${BLUE}   LUMORA PWA MANIFEST & DEPLOYMENT DIAGNOSTICS      ${RESET}`);
console.log(`${BOLD}${BLUE}====================================================${RESET}\n`);

const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
const publicDir = path.join(process.cwd(), 'public');

let hasErrors = false;
let hasWarnings = false;

// 1. Verify manifest.json Existence
console.log(`${BOLD}1. Checking manifest.json physical presence:${RESET}`);
if (!fs.existsSync(manifestPath)) {
  console.log(`  ${RED}[✗] ERROR: manifest.json is missing from /public folder!${RESET}`);
  console.log(`      Path checked: ${manifestPath}\n`);
  process.exit(1);
} else {
  console.log(`  ${GREEN}[✓] manifest.json exists in /public${RESET}\n`);
}

// 2. Try Parsing manifest.json
console.log(`${BOLD}2. Parsing and validating manifest.json structure:${RESET}`);
let manifest = null;
try {
  const content = fs.readFileSync(manifestPath, 'utf-8');
  manifest = JSON.parse(content);
  console.log(`  ${GREEN}[✓] Successfully parsed as valid JSON${RESET}`);
} catch (err) {
  console.log(`  ${RED}[✗] ERROR: Failed to parse manifest.json. Invalid JSON syntax!${RESET}`);
  console.log(`      Details: ${err.message}\n`);
  process.exit(1);
}

// 3. Check Core Metadata Fields
const expectedFields = ['name', 'short_name', 'start_url', 'display', 'icons', 'theme_color', 'background_color'];
expectedFields.forEach(field => {
  if (manifest[field] !== undefined) {
    console.log(`  ${GREEN}[✓] Found property: "${field}" -> "${typeof manifest[field] === 'object' ? '[Array/Object]' : manifest[field]}"${RESET}`);
  } else {
    console.log(`  ${RED}[✗] ERROR: Missing required PWA property: "${field}"${RESET}`);
    hasErrors = true;
  }
});
console.log('');

// 4. Validate Icons and Pathways
console.log(`${BOLD}3. Validating home screen & launcher icon resolution:${RESET}`);
if (!manifest.icons || !Array.isArray(manifest.icons) || manifest.icons.length === 0) {
  console.log(`  ${RED}[✗] ERROR: "icons" array is missing or empty!${RESET}\n`);
  hasErrors = true;
} else {
  console.log(`  Total Icons Declared: ${manifest.icons.length}`);
  
  manifest.icons.forEach((icon, idx) => {
    console.log(`  \n  Icon #${idx + 1}:`);
    console.log(`    - Declared Src: "${icon.src}"`);
    console.log(`    - Sizes:        "${icon.sizes || 'unspecified'}"`);
    console.log(`    - Type:         "${icon.type || 'unspecified'}"`);
    console.log(`    - Purpose:      "${icon.purpose || 'unspecified'}"`);

    if (!icon.src) {
      console.log(`    ${RED}[✗] Error: Icon src is empty!${RESET}`);
      hasErrors = true;
      return;
    }

    // Resolve file locally (cleaning any cache-busting query strings e.g. ?v=9 first)
    const cleanSrc = icon.src.split('?')[0];
    const relativeSrc = cleanSrc.startsWith('/') ? cleanSrc.slice(1) : cleanSrc;
    const resolvedPath = path.join(publicDir, relativeSrc);

    if (fs.existsSync(resolvedPath)) {
      const stats = fs.statSync(resolvedPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`    ${GREEN}[✓] Resolved on-disk path: ${resolvedPath}${RESET}`);
      console.log(`    ${GREEN}[✓] File size: ${sizeKB} KB${RESET}`);
      
      if (stats.size === 0) {
        console.log(`    ${RED}[✗] ERROR: File size is 0 bytes! Image is corrupt.${RESET}`);
        hasErrors = true;
      }
    } else {
      console.log(`    ${RED}[✗] ERROR: File does not exist at expected path!${RESET}`);
      console.log(`        Expected path: ${resolvedPath}`);
      hasErrors = true;
    }

    // Check PWA icon criteria
    if (!icon.sizes || !['192x192', '512x512', '180x180'].some(s => icon.sizes.includes(s))) {
      console.log(`    ${YELLOW}[!] Warning: Standard PWA guidelines recommend including explicitly 192x192 and 512x512 sizes.${RESET}`);
      hasWarnings = true;
    }
    
    if (icon.purpose && !icon.purpose.includes('any') && !icon.purpose.includes('maskable')) {
      console.log(`    ${YELLOW}[!] Warning: Purpose is specified but is neither "any" nor "maskable".${RESET}`);
      hasWarnings = true;
    }
  });
}
console.log('');

// 5. Verify index.html relation
console.log(`${BOLD}4. Verifying HTML Manifest Association:${RESET}`);
const indexPath = path.join(process.cwd(), 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  if (indexHtml.includes('rel="manifest"') || indexHtml.includes('href="/manifest.json"')) {
    console.log(`  ${GREEN}[✓] Found <link rel="manifest"> element referencing /manifest.json inside index.html${RESET}`);
  } else {
    console.log(`  ${RED}[✗] ERROR: No manifest link found inside index.html! Browser won't auto-discover the PWA.${RESET}`);
    hasErrors = true;
  }
} else {
  console.log(`  ${YELLOW}[!] Warning: index.html not found at workspace root.${RESET}`);
  hasWarnings = true;
}
console.log('');

// Diagnostic Summary Print
console.log(`${BOLD}${BLUE}====================================================${RESET}`);
console.log(`${BOLD}${BLUE}                 DIAGNOSIS REPORT                   ${RESET}`);
console.log(`${BOLD}${BLUE}====================================================${RESET}`);

if (hasErrors) {
  console.log(`\n  ${BOLD}${RED}STATUS: FAILED [✗]${RESET}`);
  console.log(`  ${RED}Please correct the errors detailed above to ensure flawless mobile home screen installation.${RESET}\n`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`\n  ${BOLD}${YELLOW}STATUS: PASS WITH WARNINGS [!]${RESET}`);
  console.log(`  ${YELLOW}All critical items are functional, but PWA experiences can be optimized with warnings logged.${RESET}\n`);
  process.exit(0);
} else {
  console.log(`\n  ${BOLD}${GREEN}STATUS: PERFECTLY HEALTHY & SECURE [✓]${RESET}`);
  console.log(`  ${GREEN}All paths resolve cleanly. The manifest is healthy and optimized for home screen install launcher!${RESET}\n`);
  process.exit(0);
}
