# pluck-tag

Extract content between XML-style tags from LLM outputs.

## Why?

Many LLM prompts ask models to wrap their responses in tags:
- `<response>` for structured outputs
- `<thinking>` for chain-of-thought reasoning
- `<answer>` for final answers
- Custom tags for specific use cases

This tool makes it easy to extract just what you need from LLM outputs.

## Install

```bash
# With npm
npm install -g pluck-tag

# With pnpm  
pnpm install -g pluck-tag

# With yarn
yarn global add pluck-tag
```

## Usage

```bash
# Extract specific tags (tag name is required)
cat llm-output.txt | pluck-tag response
cat llm-output.txt | pluck-tag thinking
cat llm-output.txt | pluck-tag answer

# Direct with echo
echo "<answer>42</answer>" | pluck-tag answer
# Output: 42

# Chain with other commands
curl -s https://api.llm.com/complete | pluck-tag response | jq .
```

## Examples

### Basic Usage

```bash
$ echo "Here's my <response>Hello World</response> for you" | pluck-tag response
Hello World
```

### Custom Tags

```bash
$ echo "Let me <thinking>consider this carefully</thinking> first" | pluck-tag thinking
consider this carefully
```

### Multiple Instances

If there are multiple instances of the same tag, all will be extracted:

```bash
$ echo "<item>First</item> and <item>Second</item>" | pluck-tag item
First
Second
```

### Tags with Attributes

Tags with attributes are supported - the tool extracts content based on tag name only:

```bash
$ echo '<div class="highlight">Important</div>' | pluck-tag div
Important
```

### Real LLM Output

```bash
$ cat gpt-output.txt
I'll analyze this step by step.

<thinking>
The user wants to know about recursive functions.
This is a fundamental programming concept.
</thinking>

<answer>
A recursive function is a function that calls itself during execution.
</answer>

$ cat gpt-output.txt | pluck-tag thinking
The user wants to know about recursive functions.
This is a fundamental programming concept.

$ cat gpt-output.txt | pluck-tag answer
A recursive function is a function that calls itself during execution.
```

## Error Handling

The tool will exit with code 1 and display an error if:
- No tag name is provided
- No input is provided
- The specified tag is not found
- The tag exists but is empty

```bash
$ echo "Hello" | pluck-tag
Error: Tag name is required
Usage: pluck-tag <tag-name>
Example: echo "<answer>42</answer>" | pluck-tag answer

$ echo "No tags here" | pluck-tag response
Error: No <response> tag found in input

$ echo "<response></response>" | pluck-tag response
Error: <response> tag(s) are empty
```

## Running from Source

```bash
# Clone the repository
git clone https://github.com/ashafovaloff/pluck-tag.git
cd pluck-tag

# Run directly
node pluck-tag.js <tag-name>

# Run tests
npm test

# Install globally from source
npm link
```

## License

MIT