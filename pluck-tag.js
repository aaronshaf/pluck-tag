#!/usr/bin/env node

const args = process.argv.slice(2);
const tagName = args[0];

async function main() {
  if (!tagName) {
    console.error('Error: Tag name is required');
    console.error('Usage: pluck-tag <tag-name>');
    console.error('Example: echo "<answer>42</answer>" | pluck-tag answer');
    process.exit(1);
  }
  
  if (tagName === '--version' || tagName === '-v') {
    const pkg = require('./package.json');
    console.log(pkg.version);
    process.exit(0);
  }
  
  if (tagName === '--help' || tagName === '-h') {
    console.log('Usage: pluck-tag <tag-name>');
    console.log('Example: echo "<answer>42</answer>" | pluck-tag answer');
    process.exit(0);
  }
  
  try {
    // Read from stdin
    let input = '';
    
    if (process.stdin.isTTY) {
      console.error('Error: No input provided');
      process.exit(1);
    }
    
    process.stdin.setEncoding('utf8');
    
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    
    if (!input || input.trim() === '') {
      console.error('Error: No input provided');
      process.exit(1);
    }
    
    // Build regex dynamically based on tag name
    // This regex handles tags with or without attributes
    const regex = new RegExp(`<${tagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagName}>`, 'g');
    const matches = Array.from(input.matchAll(regex));
    
    if (matches.length === 0) {
      console.error(`Error: No <${tagName}> tag found in input`);
      process.exit(1);
    }
    
    // Extract content from all matches
    const contents = matches.map(match => match[1].trim()).filter(content => content);
    
    if (contents.length === 0) {
      console.error(`Error: <${tagName}> tag(s) are empty`);
      process.exit(1);
    }
    
    // Output all matches, joined by newlines if multiple
    console.log(contents.join('\n'));
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();