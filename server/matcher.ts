import { LostFoundItem, LostFoundMatch } from '../src/types.ts';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'my', 'i', 'found', 'lost', 'near', 'some', 'from', 'it'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function findLostFoundMatches(items: LostFoundItem[]): LostFoundMatch[] {
  const lostItems = items.filter((i) => i.type === 'lost' && i.status !== 'resolved');
  const foundItems = items.filter((i) => i.type === 'found' && i.status !== 'resolved');

  const matches: LostFoundMatch[] = [];

  for (const lost of lostItems) {
    const lostKeywords = new Set([
      ...extractKeywords(lost.title),
      ...extractKeywords(lost.description),
    ]);

    for (const found of foundItems) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Category match (30 pts)
      if (
        lost.category &&
        found.category &&
        lost.category.toLowerCase() === found.category.toLowerCase()
      ) {
        score += 30;
        reasons.push(`Identical category: "${lost.category}"`);
      }

      // 2. Keyword matching (up to 35 pts)
      const foundKeywords = [
        ...extractKeywords(found.title),
        ...extractKeywords(found.description),
      ];
      const matchedWords = foundKeywords.filter((w) => lostKeywords.has(w));
      const uniqueMatched = Array.from(new Set(matchedWords));

      if (uniqueMatched.length > 0) {
        const keywordScore = Math.min(35, uniqueMatched.length * 12);
        score += keywordScore;
        reasons.push(
          `Overlapping keywords: ${uniqueMatched.slice(0, 4).map((w) => `"${w}"`).join(', ')}`
        );
      }

      // 3. Location proximity (up to 20 pts)
      const lostLocWords = extractKeywords(lost.location);
      const foundLocWords = new Set(extractKeywords(found.location));
      const locMatch = lostLocWords.some((w) => foundLocWords.has(w));
      if (locMatch) {
        score += 20;
        reasons.push(`Similar reported area: "${lost.location}" / "${found.location}"`);
      }

      // 4. Date proximity (up to 15 pts)
      if (lost.date && found.date) {
        const d1 = new Date(lost.date).getTime();
        const d2 = new Date(found.date).getTime();
        if (!isNaN(d1) && !isNaN(d2)) {
          const diffDays = Math.abs(d1 - d2) / (1000 * 60 * 60 * 24);
          if (diffDays <= 2) {
            score += 15;
            reasons.push(`Reported dates within 48 hours (${lost.date} & ${found.date})`);
          } else if (diffDays <= 5) {
            score += 8;
            reasons.push(`Reported dates within 5 days`);
          }
        }
      }

      // Threshold check
      if (score >= 35) {
        let confidence: LostFoundMatch['confidence'] = 'Potential';
        if (score >= 70) {
          confidence = 'High';
        } else if (score >= 50) {
          confidence = 'Medium';
        }

        matches.push({
          lostItem: lost,
          foundItem: found,
          confidence,
          score: Math.min(100, score),
          matchReasons: reasons,
        });
      }
    }
  }

  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  return matches;
}
