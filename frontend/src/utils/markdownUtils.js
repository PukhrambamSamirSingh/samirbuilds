/**
 * markdownUtils.js
 * Comprehensive utilities to process and enhance markdown, LaTeX math,
 * tables, code blocks, diagrams, and formatting.
 */

/**
 * Intelligent formatter that styles notes:
 * - Replaces text diagrams with structured interactive diagram tags
 * - Converts LaTeX brackets \[ \] and \( \) to KaTeX $$ and $
 * - Converts TSV (tab-separated tables) into GFM markdown tables
 * - Formats candidate tokens into dark pill badges (`today`, `outside`)
 * - Expands concatenated Python code snippets into fenced code blocks
 * - Turns section milestones (Part X, Example X, Step X) into clean Markdown headings
 */

/**
 * Converts a note title into a lowercase URL-friendly slug
 * e.g. "How does the Language Model Head work in a Transformer?"
 * -> "how-does-the-language-model-head-work-in-a-transformer"
 */
export function titleToSlug(title = '') {
    if (!title || typeof title !== 'string') return `note-${Date.now()}`
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function stripBoxed(str) {
    if (!str || (!str.includes('\\boxed') && !str.includes('\\fbox'))) return str
    let res = ''
    let i = 0
    while (i < str.length) {
        let matchLen = 0
        if (str.startsWith('\\boxed', i)) {
            matchLen = 6
        } else if (str.startsWith('\\fbox', i)) {
            matchLen = 5
        }
        if (matchLen > 0) {
            let j = i + matchLen
            while (j < str.length && /\s/.test(str[j])) j++
            if (str[j] === '{') {
                i = j + 1
                let depth = 1
                let content = ''
                while (i < str.length && depth > 0) {
                    if (str[i] === '{') depth++
                    else if (str[i] === '}') {
                        depth--
                        if (depth === 0) {
                            i++
                            break
                        }
                    }
                    content += str[i]
                    i++
                }
                res += stripBoxed(content)
                continue
            }
        }
        res += str[i]
        i++
    }
    return res
}

export function formatMathAndMarkdown(rawText) {
    if (!rawText || typeof rawText !== 'string') return ''
    let text = rawText

    // Fix any previously mangled image URLs (e.g. where _ was turned into _{\scriptscriptstyle...})
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
        const cleanUrl = url
            .replace(/_\{(\\scriptscriptstyle)?\\text\{([a-zA-Z0-9_-]*)\}\}/g, '_$2')
            .replace(/_\{(\\scriptscriptstyle)?\\text\{\}\}/g, '_')
            .replace(/_\{([a-zA-Z0-9_-]+)\}/g, '_$1')
        return `![${alt}](${cleanUrl})`
    })

    // Protect all markdown images from text/math transformations
    const protectedImages = []
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
        const token = `XXIMGTOKEN${protectedImages.length}XX`
        protectedImages.push({ token, match })
        return token
    })

    // Protect all fenced code blocks from text/math transformations
    const protectedCodes = []
    text = text.replace(/```[\s\S]*?```/g, (match) => {
        const token = `XXCODETOKEN${protectedCodes.length}XX`
        protectedCodes.push({ token, match })
        return token
    })

    // 0. Replace "Where FFN fits in a Transformer" text diagram with dedicated diagram token
    const ffnDiagramPattern = /(?:###?\s*)?Where FFN fits in a Transformer[\s\S]*?Token representations[\s\S]*?Input vectors[\s\S]*?Self-attention[\s\S]*?FFN[\s\S]*?Updated representations[\s\S]*?Ready for the next layer(?:\s*\n+Simplified view[^\n]*)?/i
    if (ffnDiagramPattern.test(text)) {
        text = text.replace(ffnDiagramPattern, '\n\n:::ffn-transformer-flow:::\n\n')
    }

    // 1. Replace "The entire idea in one picture" text diagram with dedicated diagram token
    const entireIdeaPattern = /The entire idea in one picture[\s\S]*?Choose the next token[\s\S]*?For greedy decoding, choose\s+today[^\n]*/i
    if (entireIdeaPattern.test(text)) {
        text = text.replace(entireIdeaPattern, '### The entire idea in one picture\n\n:::pipeline-flow:::\n')
    }

    // 2. Replace "Explore the logits" with interactive logits chart token
    const logitsPattern = /Explore the logits[\s\S]*?These are the raw scores before softmax[\s\S]*?today\s+1\.30[\s\S]*?\.\s+-0\.25/i
    if (logitsPattern.test(text)) {
        text = text.replace(logitsPattern, ':::logits-chart:::\n')
    }

    // 3. Replace "Final next-token probabilities" with probability chart token
    const probsPattern = /Final next-token probabilities[\s\S]*?today[\s\S]*?39\.8%[\s\S]*?\.\s+8\.5%/i
    if (probsPattern.test(text)) {
        text = text.replace(probsPattern, ':::probabilities-chart:::\n')
    }

    // 4. Replace "One vector per position" with multi-position diagram token
    const multiPosPattern = /One vector per position[\s\S]*?Shared Language Model Head[\s\S]*?Predict next token/i
    if (multiPosPattern.test(text)) {
        text = text.replace(multiPosPattern, ':::multi-position-diagram:::\n')
    }

    // 5. Fix concatenated Python code from ChatGPT copy-paste
    if (text.includes('import torch') && text.includes('lm_head = nn.Linear') && !text.includes('```python')) {
        const messyCodePattern = /import torchimport torch\.nn as nn[\s\S]*?print\("Most likely token:", tokens\[predicted_id\]\)/
        const cleanPytorchCode = 
`\`\`\`python
import torch
import torch.nn as nn

# A tiny vocabulary of 5 tokens
vocab_size = 5
n_embd = 3
lm_head = nn.Linear(n_embd, vocab_size, bias=False)

# Final hidden vector at the current position
h = torch.tensor([[0.8, 0.2, 0.5]])

# Convert the hidden vector into vocabulary logits
logits = lm_head(h)

# Convert logits into probabilities
probs = torch.softmax(logits, dim=-1)
tokens = ["today", "outside", "because", "warm", "."]

print("Hidden vector shape:", h.shape)
print("Head weight shape:", lm_head.weight.shape)
print("Logits shape:", logits.shape)
print("Logits:", logits)
print("Probabilities:", probs)
predicted_id = probs.argmax(dim=-1).item()
print("Most likely token:", tokens[predicted_id])
\`\`\``
        text = text.replace(messyCodePattern, cleanPytorchCode)
    }

    if (text.includes('# idx contains token IDs') && !text.includes('```')) {
        const messyForwardPattern = /# idx contains token IDs: \(batch_size, sequence_length\)[\s\S]*?logits = lm_head\(x\)/
        const cleanForwardCode = 
`\`\`\`python
# idx contains token IDs: (batch_size, sequence_length)
x = token_embedding(idx) + positional_embedding
x = transformer_blocks(x)
x = final_layer_norm(x)
logits = lm_head(x)
\`\`\``
        text = text.replace(messyForwardPattern, cleanForwardCode)
    }

    text = text.replace(/(?<!```[\s\S]*?)(self\.lm_head = nn\.Linear\([^\n]+\))/g, '\n```python\n$1\n```\n')

    // 6. Convert Display Math \[ ... \] to \n\n$$\n...\n$$\n\n
    text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
        return '\n\n$$\n' + math.trim() + '\n$$\n\n'
    })

    // 7. Convert Inline Math \( ... \) to $...$
    text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
        return ` $${math.trim()}$ `
    })

    // 8. Standalone LaTeX environments (bmatrix, aligned, matrix, cases) not already wrapped in $$
    text = text.replace(/(?<!\$\$[\s\S]*?)(\\begin\{(bmatrix|pmatrix|vmatrix|matrix|aligned|cases|equation)\}[\s\S]*?\\end\{\2\})/g, (_, env) => {
        return '\n\n$$\n' + env.trim() + '\n$$\n\n'
    })

    // Strip all \boxed{...} frames cleanly handling nested braces so no output is ever wrapped in a rectangular box
    text = stripBoxed(text)

    // Format wordings in subscripts (e.g. W_{\text{vocab}}, W_{vocab}, z_{outside}) matching screenshot
    text = text.replace(/\\scriptscriptstyle/g, '')
    text = text.replace(/_\{(\\text\{[a-zA-Z0-9_-]+\})\}/g, '_$1')
    text = text.replace(/_\{([a-zA-Z]{2,})\}/g, '_{\\text{$1}}')
    text = text.replace(/_([a-zA-Z]{3,})/g, '_{\\text{$1}}')
    text = text.replace(/Wvocab/g, 'W_{\\text{vocab}}')
    text = text.replace(/W_\{vocab\}/g, 'W_{\\text{vocab}}')
    text = text.replace(/W_vocab/g, 'W_{\\text{vocab}}')
    text = text.replace(/zoutside/g, 'z_{\\text{outside}}')
    text = text.replace(/z_outside/g, 'z_{\\text{outside}}')
    text = text.replace(/ztoday/g, 'z_{\\text{today}}')
    text = text.replace(/z_today/g, 'z_{\\text{today}}')
    text = text.replace(/zbecause/g, 'z_{\\text{because}}')
    text = text.replace(/z_because/g, 'z_{\\text{because}}')

    // 9. Format candidate tokens into dark pill badges (`today`, `outside`) matching screenshots
    text = text.replace(/The score for\s+today\s+is\s+1\.3/g, 'The score for `today` is 1.3')
    text = text.replace(/Example A:\s*Calculate the score for\s+today/g, 'Example A: Calculate the score for `today`')
    text = text.replace(/Example B:\s*Calculate the score for\s+outside/g, 'Example B: Calculate the score for `outside`')
    text = text.replace(/Example C:\s*Calculate the score for\s+because/g, 'Example C: Calculate the score for `because`')
    text = text.replace(/associated with\s+(today|outside|because|warm|\.)\s+is/g, 'associated with `$1` is')
    text = text.replace(/for\s+(today|outside|because|warm)\s+is/g, 'for `$1` is')
    text = text.replace(/For\s+(today|outside|because|warm|\.):/g, 'For `$1`:')
    text = text.replace(/choose\s+today\s+in this example/g, 'choose `today` in this example')
    text = text.replace(/next token be\s+(today|outside|because)\?/g, 'next token be `$1`?')
    text = text.replace(/token is\s+today/g, 'token is `today`')

    // 10. Convert Tab-Separated Tables (TSV) to GFM Markdown Tables
    const lines = text.split('\n')
    const processedLines = []
    let tsvLines = []

    const flushTsv = () => {
        if (tsvLines.length >= 2) {
            const rows = tsvLines.map(line => line.split('\t').map(c => c.trim()))
            const maxCols = Math.max(...rows.map(r => r.length))
            if (maxCols >= 2) {
                const header = rows[0]
                while (header.length < maxCols) header.push('')
                processedLines.push('')
                processedLines.push('| ' + header.join(' | ') + ' |')
                processedLines.push('| ' + header.map(() => '---').join(' | ') + ' |')
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i]
                    while (row.length < maxCols) row.push('')
                    processedLines.push('| ' + row.join(' | ') + ' |')
                }
                processedLines.push('')
                tsvLines = []
                return
            }
        }
        processedLines.push(...tsvLines)
        tsvLines = []
    }

    for (const line of lines) {
        if (line.includes('\t') && line.trim().length > 0) {
            tsvLines.push(line)
        } else {
            flushTsv()
            processedLines.push(line)
        }
    }
    flushTsv()
    text = processedLines.join('\n')

    // 11. Section & Step Headings (only if not already markdown headings)
    text = text.replace(/^(?<!#+\s+)(Part\s+\d+[\s:—–-].*)$/gm, '\n## $1\n')
    text = text.replace(/^(?<!#+\s+)(Example\s+[A-Z0-9]+[\s:—–-].*)$/gm, '\n### $1\n')
    // Opening title if it starts with question format
    text = text.replace(/^(?<!#+\s+)(How does .*?\?|What does .*?\?|Why does .*?\?|What happens .*?\?)$/m, '\n# $1\n')
    // Remaining question section headings in the body
    text = text.replace(/^(?<!#+\s+)(How does .*?\?|What does .*?\?|Why does .*?\?|What happens .*?\?)$/gm, '\n### $1\n')

    // Clean up excessive consecutive blank lines
    text = text.replace(/\n{4,}/g, '\n\n\n')

    // Restore protected code blocks
    protectedCodes.forEach(({ token, match }) => {
        text = text.replace(token, match)
    })

    // Restore protected images with verified clean URLs
    protectedImages.forEach(({ token, match }) => {
        text = text.replace(token, match)
    })

    return text.trim()
}

/**
 * Strips raw LaTeX math, code, and markdown syntax to yield
 * clean, readable plain text for sidebar cards, excerpts, and search.
 */
export function getPlainTextExcerpt(content = '', maxLength = 140) {
    if (!content) return ''
    let clean = content
        .replace(/:::[a-z-]+:::/gi, '')
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        .replace(/\\\[[\s\S]*?\\\]/g, '')
        .replace(/\$[^$]+\$/g, '')
        .replace(/\\\([\s\S]*?\\\)/g, '')
        .replace(/\\begin\{[a-z*]+\}[\s\S]*?\\end\{[a-z*]+\}/gi, '')
        .replace(/^#+\s+/gm, '')
        .replace(/[*_`~]/g, '')
        .replace(/\|[^\n]+\|/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    if (clean.length > maxLength) {
        return clean.slice(0, maxLength).trim() + '…'
    }
    return clean || 'No text preview available'
}

/**
 * Reading statistics calculator
 */
export function calculateReadingStats(content = '') {
    const clean = content
        .replace(/:::[a-z-]+:::/gi, ' ')
        .replace(/```[\s\S]*?```/g, ' [code] ')
        .replace(/\$\$[\s\S]*?\$\$/g, ' [formula] ')
        .replace(/\s+/g, ' ')
        .trim()
    const words = clean ? clean.split(/\s+/).length : 0
    const minutes = Math.max(1, Math.ceil(words / 200))
    return {
        wordCount: words,
        readingTime: `${minutes} min read`,
        estimatedMinutes: minutes
    }
}

export const cleanAndFormatChatGPTText = formatMathAndMarkdown
