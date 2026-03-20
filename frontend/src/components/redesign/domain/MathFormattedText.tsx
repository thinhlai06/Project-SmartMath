import { Fragment } from 'react';

interface MathFormattedTextProps {
  text: string;
  highlightKeywords?: string[];
}

function splitByKeywords(text: string, keywords: string[]): string[] {
  if (keywords.length === 0) {
    return [text];
  }

  const escapedKeywords = keywords
    .map((keyword) => keyword.trim())
    .filter(Boolean)
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (escapedKeywords.length === 0) {
    return [text];
  }

  const keywordRegex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  return text.split(keywordRegex);
}

export function MathFormattedText({ text, highlightKeywords = [] }: MathFormattedTextProps) {
  const normalizedHighlights = highlightKeywords.map((keyword) => keyword.toLowerCase());
  const parts = splitByKeywords(text, highlightKeywords);

  return (
    <p className="text-sm leading-7 text-slate-800">
      {parts.map((part, index) => {
        const isHighlight = normalizedHighlights.includes(part.toLowerCase());

        if (isHighlight) {
          return (
            <mark key={`${part}-${index}`} className="rounded bg-yellow-100 px-1 text-slate-900">
              {part}
            </mark>
          );
        }

        return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
      })}
    </p>
  );
}
