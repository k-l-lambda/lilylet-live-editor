#!/usr/bin/env node
/**
 * Build documentation - converts markdown files to styled HTML
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import MarkdownIt from 'markdown-it';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Initialize markdown-it with syntax highlighting support
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Custom renderer for code blocks with lilylet syntax highlighting
const defaultFence = md.renderer.rules.fence;
md.renderer.rules.fence = (tokens, idx, options, env, self) => {
  const token = tokens[idx];
  const info = token.info.trim();
  const content = token.content;

  // Check if it's a lilylet code block
  if (info === 'lilylet' || info === 'lyl') {
    const escaped = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return `<pre class="lilylet-code"><code class="language-lilylet">${escaped}</code></pre>`;
  }

  return defaultFence(tokens, idx, options, env, self);
};

// HTML template with styling
const htmlTemplate = (title, content) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg-primary: #1e1e1e;
      --bg-secondary: #252526;
      --bg-tertiary: #2d2d30;
      --text-primary: #d4d4d4;
      --text-secondary: #858585;
      --accent: #0e639c;
      --accent-hover: #1177bb;
      --border: #454545;
      --code-bg: #1a1a1a;
      --link: #4fc1ff;
      --success: #4ec9b0;
      --warning: #dcdcaa;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px 40px 60px;
    }

    header {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      padding: 12px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    header nav {
      max-width: 900px;
      margin: 0 auto;
      display: flex;
      gap: 20px;
      align-items: center;
    }

    header a {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px;
    }

    header a:hover {
      color: var(--text-primary);
    }

    header .brand {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 16px;
    }

    h1 {
      color: #ffffff;
      font-size: 2.5em;
      margin: 1em 0 0.5em;
      padding-bottom: 0.3em;
      border-bottom: 1px solid var(--border);
    }

    h2 {
      color: #ffffff;
      font-size: 1.8em;
      margin: 1.5em 0 0.5em;
      padding-bottom: 0.2em;
      border-bottom: 1px solid var(--border);
    }

    h3 {
      color: var(--success);
      font-size: 1.3em;
      margin: 1.2em 0 0.5em;
    }

    h4 {
      color: var(--warning);
      font-size: 1.1em;
      margin: 1em 0 0.5em;
    }

    p {
      margin: 0.8em 0;
    }

    a {
      color: var(--link);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    code {
      font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
      background: var(--code-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }

    pre {
      background: var(--code-bg);
      padding: 16px 20px;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid var(--border);
      margin: 1em 0;
    }

    pre code {
      background: none;
      padding: 0;
      font-size: 14px;
      line-height: 1.5;
    }

    pre.lilylet-code {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-left: 4px solid var(--accent);
    }

    pre.lilylet-code code {
      color: #e0e0e0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
      font-size: 0.95em;
    }

    th, td {
      border: 1px solid var(--border);
      padding: 10px 14px;
      text-align: left;
    }

    th {
      background: var(--bg-tertiary);
      color: #ffffff;
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: var(--bg-secondary);
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 0.8em 0;
    }

    li {
      margin: 0.3em 0;
    }

    blockquote {
      border-left: 4px solid var(--accent);
      margin: 1em 0;
      padding: 0.5em 1em;
      background: var(--bg-secondary);
      border-radius: 0 4px 4px 0;
    }

    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2em 0;
    }

    strong {
      color: #ffffff;
    }

    em {
      color: var(--warning);
    }

    /* Table of contents styling */
    .container > ol:first-of-type {
      background: var(--bg-secondary);
      padding: 20px 20px 20px 40px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .container > ol:first-of-type li {
      margin: 0.4em 0;
    }

    /* Quick reference card styling */
    h3:contains("Quick Reference") + * {
      background: var(--bg-tertiary);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .container {
        padding: 15px 20px 40px;
      }

      h1 {
        font-size: 2em;
      }

      h2 {
        font-size: 1.5em;
      }

      pre {
        padding: 12px 14px;
      }

      table {
        font-size: 0.85em;
      }

      th, td {
        padding: 8px 10px;
      }
    }

    /* Print styles */
    @media print {
      body {
        background: white;
        color: black;
      }

      header {
        display: none;
      }

      pre {
        background: #f5f5f5;
        border: 1px solid #ddd;
      }

      a {
        color: #0066cc;
      }
    }
  </style>
</head>
<body>
  <header>
    <nav>
      <a href="/lilylet-live-editor/" class="brand">Lilylet</a>
      <a href="/lilylet-live-editor/">Editor</a>
      <a href="/lilylet-live-editor/markdown">Markdown Demo</a>
      <a href="/lilylet-live-editor/docs/tutorial.html">Tutorial</a>
    </nav>
  </header>
  <div class="container">
    ${content}
  </div>
</body>
</html>`;

// Process markdown files
function buildDocs() {
  const docsDir = path.join(rootDir, 'static', 'docs');
  const outputDir = path.join(rootDir, 'static', 'docs');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Find all markdown files
  const mdFiles = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));

  for (const mdFile of mdFiles) {
    const mdPath = path.join(docsDir, mdFile);
    const htmlFile = mdFile.replace('.md', '.html');
    const htmlPath = path.join(outputDir, htmlFile);

    console.log(`Converting ${mdFile} -> ${htmlFile}`);

    // Read markdown content
    const mdContent = fs.readFileSync(mdPath, 'utf-8');

    // Extract title from first H1
    const titleMatch = mdContent.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : 'Documentation';

    // Convert to HTML
    const htmlContent = md.render(mdContent);

    // Generate full HTML page
    const fullHtml = htmlTemplate(title, htmlContent);

    // Write HTML file
    fs.writeFileSync(htmlPath, fullHtml);
    console.log(`  Written: ${htmlPath}`);
  }

  // Create index redirect if tutorial exists
  const tutorialHtml = path.join(outputDir, 'lilylet-tutorial.html');
  if (fs.existsSync(tutorialHtml)) {
    const indexPath = path.join(outputDir, 'index.html');
    const indexContent = `<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=lilylet-tutorial.html">
  <title>Redirecting...</title>
</head>
<body>
  <p>Redirecting to <a href="lilylet-tutorial.html">tutorial</a>...</p>
</body>
</html>`;
    fs.writeFileSync(indexPath, indexContent);
    console.log(`  Written: ${indexPath} (redirect)`);
  }

  console.log('\nDocs build complete!');
}

buildDocs();
