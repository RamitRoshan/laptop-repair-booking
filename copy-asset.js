import fs from 'fs';
import path from 'path';

const brainDir = "C:\\Users\\ramit\\.gemini\\antigravity-ide\\brain\\3dd4a81c-88a6-4937-a2a7-7488a386c260";
const destDir = path.join(process.cwd(), 'public');

const filesToCopy = [
  { srcName: 'tilted_macbook_mockup_1779872598239.png', destName: 'tilted_macbook_mockup.png' },
  { srcName: 'student_discount_avatar_1779874372910.png', destName: 'student_discount_avatar.png' }
];

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  filesToCopy.forEach(({ srcName, destName }) => {
    const src = path.join(brainDir, srcName);
    const dest = path.join(destDir, destName);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`✓ Successfully copied ${destName} to public/ folder!`);
    } else {
      console.error(`✗ Source file not found: ${src}`);
    }
  });
} catch (err) {
  console.error("✗ Error copying generated assets:", err.message);
}
