#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.join(__dirname, 'pluck-tag.js');

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, input, args, expectedOutput, shouldFail = false) {
  return new Promise((resolve) => {
    const child = spawn('node', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      const passed = shouldFail 
        ? (code !== 0 && stderr.includes(expectedOutput))
        : (code === 0 && stdout.trim() === expectedOutput);
      
      if (passed) {
        console.log(`✓ ${name}`);
        testsPassed++;
      } else {
        console.log(`✗ ${name}`);
        console.log(`  Expected: ${expectedOutput}`);
        console.log(`  Got: ${shouldFail ? stderr.trim() : stdout.trim()}`);
        console.log(`  Exit code: ${code}`);
        testsFailed++;
      }
      resolve();
    });
    
    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
}

async function runTests() {
  console.log('Running pluck-tag tests...\n');
  
  // Test basic extraction
  await runTest(
    'Basic tag extraction',
    '<answer>42</answer>',
    ['answer'],
    '42'
  );
  
  // Test extraction with surrounding text
  await runTest(
    'Tag extraction with surrounding text',
    'Here is my <response>Hello World</response> for you',
    ['response'],
    'Hello World'
  );
  
  // Test multiple instances
  await runTest(
    'Multiple tag instances',
    '<item>First</item> and <item>Second</item>',
    ['item'],
    'First\nSecond'
  );
  
  // Test nested content with newlines
  await runTest(
    'Tag with multiline content',
    '<thinking>\nLine 1\nLine 2\n</thinking>',
    ['thinking'],
    'Line 1\nLine 2'
  );
  
  // Test empty tag error
  await runTest(
    'Empty tag error',
    '<empty></empty>',
    ['empty'],
    'Error: <empty> tag(s) are empty',
    true
  );
  
  // Test missing tag error
  await runTest(
    'Missing tag error',
    'No tags here',
    ['response'],
    'Error: No <response> tag found in input',
    true
  );
  
  // Test no arguments error
  await runTest(
    'No arguments error',
    'Some input',
    [],
    'Error: Tag name is required',
    true
  );
  
  // Test with special characters in tag content
  await runTest(
    'Special characters in content',
    '<code>const x = "hello";</code>',
    ['code'],
    'const x = "hello";'
  );
  
  // Test tag with attributes (should still work)
  await runTest(
    'Tag name extraction (ignores attributes)',
    '<div class="test">content</div>',
    ['div'],
    'content'
  );
  
  // Test case sensitivity
  await runTest(
    'Case sensitive tags',
    '<Answer>42</Answer>',
    ['Answer'],
    '42'
  );
  
  // Test whitespace trimming
  await runTest(
    'Whitespace trimming',
    '<response>  \n  spaced  \n  </response>',
    ['response'],
    'spaced'
  );
  
  console.log('\n' + '='.repeat(40));
  console.log(`Tests passed: ${testsPassed}`);
  console.log(`Tests failed: ${testsFailed}`);
  console.log('='.repeat(40));
  
  process.exit(testsFailed > 0 ? 1 : 0);
}

runTests();