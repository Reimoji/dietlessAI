'use client';

import React, { useState, useEffect } from 'react';

interface ChunkRevealProps {
  content: string;
  chunkDelay?: number;
  onComplete?: () => void;
  className?: string;
}

export function ChunkReveal({
  content,
  chunkDelay = 500, // Default delay of 500ms
  onComplete,
  className = '',
}: ChunkRevealProps) {
  const [visibleChunks, setVisibleChunks] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset when content changes
    setVisibleChunks([]);
    setIsComplete(false);
    
    // Split content into meaningful chunks (sentences or paragraphs)
    const chunks = splitIntoChunks(content);
    
    // Reveal chunks one by one with the delay
    chunks.forEach((chunk, index) => {
      setTimeout(() => {
        setVisibleChunks(chunks.slice(0, index + 1));
        
        // Check if this is the last chunk
        if (index === chunks.length - 1) {
          setIsComplete(true);
          onComplete?.();
        }
      }, chunkDelay * (index + 1));
    });
    
    // Cleanup function to prevent memory leaks
    return () => {
      setVisibleChunks([]);
      setIsComplete(true);
    };
  }, [content, chunkDelay, onComplete]);

  // Function to split content into meaningful chunks
  const splitIntoChunks = (text: string): string[] => {
    // First try to split by paragraphs (double newlines)
    const paragraphs = text.split(/\n\n+/);
    
    if (paragraphs.length > 1) {
      return paragraphs;
    }
    
    // If no paragraphs, split by sentences
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter(sentence => sentence.trim().length > 0);
      
    if (sentences.length > 1) {
      return sentences;
    }
    
    // If it's just one sentence, split by commas or other natural breaks
    const chunks = text
      .split(/(?<=[,;:])\s+/)
      .filter(chunk => chunk.trim().length > 0);
      
    // If we still have only one chunk, split it into smaller pieces
    if (chunks.length <= 1 && text.length > 50) {
      // Split into roughly equal chunks of ~30 characters
      const smallChunks = [];
      const chunkSize = 30;
      for (let i = 0; i < text.length; i += chunkSize) {
        smallChunks.push(text.slice(i, i + chunkSize));
      }
      return smallChunks;
    }
    
    return chunks;
  };

  // Pre-process the content to maintain consistent formatting
  const processContent = (chunks: string[]): string => {
    // Join chunks with proper spacing
    let joinedContent = chunks.join(' ');
    
    // Preserve newlines in the original content
    const originalNewlines = content.match(/\n+/g) || [];
    const joinedNewlines = joinedContent.match(/\n+/g) || [];
    
    // If the original has more newlines than our joined content,
    // we need to preserve the structure
    if (originalNewlines.length > joinedNewlines.length) {
      // For structured content like workout plans, preserve the entire structure
      // but only show the parts that have been revealed
      const fullContentLines = content.split('\n');
      const revealedLines = [];
      let totalChars = 0;
      
      // Calculate how many characters we've revealed so far
      const revealedCharsCount = chunks.join(' ').length;
      
      // Add lines until we've reached the revealed character count
      for (const line of fullContentLines) {
        revealedLines.push(line);
        totalChars += line.length + 1; // +1 for the newline
        
        if (totalChars >= revealedCharsCount) {
          break;
        }
      }
      
      joinedContent = revealedLines.join('\n');
    }
    
    // Apply formatting to the joined content
    return formatChunk(joinedContent);
  };

  return (
    <div className={className}>
      {/* Process and format the visible chunks */}
      <div 
        className="animate-fadeIn whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: processContent(visibleChunks) }}
      />
      
      {!isComplete && (
        <div className="flex items-center mt-4">
          <div className="flex space-x-1">
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}
    </div>
  );
}

// Format individual chunks with markdown-like syntax
function formatChunk(chunk: string): string {
  if (!chunk) return '';
  
  return chunk
    // Bold text: **text** -> <strong>text</strong>
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    
    // Italic text: *text* -> <em>text</em>
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    
    // Lists: - item -> <li>item</li>
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    
    // Headers: # Header -> <h3>Header</h3>
    .replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
    
    // Subheaders: ## Header -> <h4>Header</h4>
    .replace(/^## (.+)$/gm, '<h4 class="text-md font-semibold my-1">$1</h4>')
    
    // Preserve line breaks
    .replace(/\n/g, '<br>');
}









