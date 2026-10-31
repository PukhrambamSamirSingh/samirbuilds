/**
 * Related Notes Vector / Term Relevance Utility
 * Implements high-accuracy semantic and keyword relevance scoring
 * for deep-dive mathematical and technical notes.
 */

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'in', 'on', 'at',
  'to', 'for', 'with', 'about', 'between', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'from', 'up', 'down', 'of', 'off', 'over', 'under',
  'then', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'will', 'just',
  'should', 'now', 'it', 'its', 'this', 'that', 'these', 'those', 'what', 'which',
  'who', 'whom', 'whose', 'does', 'did', 'doing', 'have', 'has', 'had', 'having',
  'would', 'could', 'been', 'being', 'part', 'note', 'article', 'read', 'with'
])

export function extractKeywords(text, maxWords = 10) {
  if (!text) return []
  // Strip code blocks and non-alphanumeric chars
  const cleaned = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .toLowerCase()

  const tokens = cleaned.split(/\s+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w))

  const freq = {}
  for (const w of tokens) {
    freq[w] = (freq[w] || 0) + 1
  }

  return Object.keys(freq)
    .sort((a, b) => freq[b] - freq[a])
    .slice(0, maxWords)
}

export function calculateRelatedNotes(currentNote, allNotes, maxCount = 24) {
  if (!currentNote || !Array.isArray(allNotes)) return []

  const currentId = currentNote._id || currentNote.slug || currentNote.title
  const currentTag = (currentNote.tag || '').trim().toLowerCase()
  const currentTitleWords = extractKeywords(currentNote.title || '', 8)
  const currentContentWords = extractKeywords(currentNote.content || '', 12)

  const candidates = allNotes.filter(n => {
    const nId = n._id || n.slug || n.title
    return nId !== currentId && (n.slug || '').toLowerCase() !== (currentNote.slug || '').toLowerCase()
  })

  const scored = candidates.map(note => {
    let score = 0
    const noteTag = (note.tag || '').trim().toLowerCase()
    const noteTitle = (note.title || '').toLowerCase()
    const noteContent = (note.content || '').toLowerCase()

    // 1. Tag match (Highest category relevance: 15 points)
    if (currentTag && noteTag === currentTag) {
      score += 15
    }

    // 2. Title keywords overlap (5 points each for title match, 2 points for content match)
    for (const kw of currentTitleWords) {
      if (noteTitle.includes(kw)) {
        score += 5
      } else if (noteContent.includes(kw)) {
        score += 2
      }
    }

    // 3. Content keywords overlap (3 points for title, 1.5 for content)
    for (const kw of currentContentWords) {
      if (noteTitle.includes(kw)) {
        score += 3
      } else if (noteContent.includes(kw)) {
        score += 1.5
      }
    }

    return { note, score }
  })

  // Sort by score descending, then by publication date if available
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const dateA = new Date(a.note.published_at || 0).getTime()
    const dateB = new Date(b.note.published_at || 0).getTime()
    return dateB - dateA
  })

  return scored.slice(0, maxCount).map(s => s.note)
}

