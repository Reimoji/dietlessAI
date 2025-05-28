// Types for better type safety
interface FormatRule {
  name: string;
  pattern: RegExp;
  replacement: string | ((match: string, ...args: any[]) => string);
  priority: number;
}

interface TableRow {
  cells: string[];
  isHeader: boolean;
  isSeparator: boolean;
}

interface ProcessingOptions {
  enableTables: boolean;
  enableLists: boolean;
  enableHeaders: boolean;
  enableLinks: boolean;
  maxContentLength: number;
}

// Constants for better maintainability
const DEFAULT_OPTIONS: ProcessingOptions = {
  enableTables: true,
  enableLists: true,
  enableHeaders: true,
  enableLinks: true,
  maxContentLength: 100000, // 100KB limit
};

const HEADER_KEYWORDS = ['Exercise', 'Sets', 'Reps', 'Day', 'Focus', 'Workout', 'Name', 'Type', 'Duration'];

/**
 * Enhanced message formatter with improved architecture and error handling
 */
export class MessageFormatter {
  private options: ProcessingOptions;
  private formatRules: FormatRule[];

  constructor(options: Partial<ProcessingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.formatRules = this.initializeFormatRules();
  }

  /**
   * Main formatting function with error handling and validation
   */
  public formatMessage(content: string): string {
    try {
      if (!this.validateInput(content)) {
        return content; // Return original if validation fails
      }

      let processedContent = this.preProcessContent(content);
      processedContent = this.applyFormatting(processedContent);
      return this.postProcessContent(processedContent);

    } catch (error) {
      console.error('Error formatting message:', error);
      return content; // Fallback to original content
    }
  }

  /**
   * Validate input content
   */
  private validateInput(content: string): boolean {
    if (typeof content !== 'string') {
      console.warn('Content must be a string');
      return false;
    }

    if (content.length > this.options.maxContentLength) {
      console.warn(`Content exceeds maximum length of ${this.options.maxContentLength} characters`);
      return false;
    }

    return true;
  }

  /**
   * Pre-process content to handle edge cases
   */
  private preProcessContent(content: string): string {
    if (!content.trim()) return '';

    let processed = content;

    // Combine adjacent tables separated by empty lines
    processed = this.combineAdjacentTables(processed);

    // Remove duplicate consecutive lines
    processed = this.removeDuplicateLines(processed);

    // Normalize line endings
    processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    return processed;
  }

  /**
   * Apply all formatting rules in order of priority
   */
  private applyFormatting(content: string): string {
    let result = content;

    // Sort rules by priority (higher number = higher priority)
    const sortedRules = [...this.formatRules].sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        if (typeof rule.replacement === 'string') {
          result = result.replace(rule.pattern, rule.replacement);
        } else {
          result = result.replace(rule.pattern, rule.replacement);
        }
      } catch (error) {
        console.warn(`Error applying rule "${rule.name}":`, error);
      }
    }

    return result;
  }

  /**
   * Initialize formatting rules with priorities
   */
  private initializeFormatRules(): FormatRule[] {
    const rules: FormatRule[] = [];

    // Tables (highest priority)
    if (this.options.enableTables) {
      rules.push({
        name: 'tables',
        pattern: /^\|(.+)\|$/gm,
        replacement: (match: string, contents: string) => this.processTableRow(match, contents),
        priority: 100
      });

      rules.push({
        name: 'combineTableRows',
        pattern: /(<tr>.+?<\/tr>)(\s*<tr>.+?<\/tr>)+/gs,
        replacement: (match: string) => this.combineTableRows(match),
        priority: 99
      });
    }

    // Headers
    if (this.options.enableHeaders) {
      rules.push(
        {
          name: 'header1',
          pattern: /^# (.+)$/gm,
          replacement: '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>',
          priority: 90
        },
        {
          name: 'header2',
          pattern: /^## (.+)$/gm,
          replacement: '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>',
          priority: 89
        },
        {
          name: 'header3',
          pattern: /^### (.+)$/gm,
          replacement: '<h3 class="text-lg font-bold mt-6 mb-3">$1</h3>',
          priority: 88
        }
      );
    }

    // Lists
    if (this.options.enableLists) {
      rules.push(
        {
          name: 'numberedLists',
          pattern: /^(\d+)\.\s+(.+)$/gm,
          replacement: '<div class="flex items-start mb-3 ml-1"><span class="font-bold mr-2 min-w-[20px] text-right">$1.</span><span>$2</span></div>',
          priority: 80
        },
        {
          name: 'nestedBulletLists',
          pattern: /^(\s{2,})[•\-\*]\s+(.+)$/gm,
          replacement: '<div class="flex items-start mb-2 ml-8"><span class="text-sm mr-2 min-w-[20px] text-center">-</span><span>$2</span></div>',
          priority: 79
        },
        {
          name: 'bulletLists',
          pattern: /^[•\-\*]\s+(.+)$/gm,
          replacement: '<div class="flex items-start mb-3 ml-1"><span class="text-lg mr-2 min-w-[20px] text-center">•</span><span>$1</span></div>',
          priority: 78
        }
      );
    }

    // Text formatting
    rules.push(
      {
        name: 'bold',
        pattern: /\*\*(.+?)\*\*/g,
        replacement: '<strong>$1</strong>',
        priority: 70
      },
      {
        name: 'italic',
        pattern: /\*([^*]+)\*/g,
        replacement: '<em>$1</em>',
        priority: 69
      }
    );

    // Special formatting
    rules.push(
      {
        name: 'whyLabels',
        pattern: /^(Why:)(.+)$/gm,
        replacement: '<div class="my-3"><span class="font-semibold text-primary mr-1">Why:</span><span>$2</span></div>',
        priority: 60
      },
      {
        name: 'sampleSessionLabels',
        pattern: /^(Sample Session.+:)$/gm,
        replacement: '<div class="font-semibold text-lg mt-4 mb-3">$1</div>',
        priority: 59
      },
      {
        name: 'quotes',
        pattern: /^>[\s]+(.+)$/gm,
        replacement: '<blockquote class="pl-4 border-l-4 border-muted italic text-muted-foreground my-3">$1</blockquote>',
        priority: 58
      }
    );

    // Links
    if (this.options.enableLinks) {
      rules.push({
        name: 'autoLinks',
        pattern: /(https?:\/\/[^\s]+)/g,
        replacement: '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>',
        priority: 50
      });
    }

    // Layout elements (lowest priority)
    rules.push(
      {
        name: 'sectionDividers',
        pattern: /^--+$/gm,
        replacement: '<hr class="my-5 border-t border-muted" />',
        priority: 20
      },
      {
        name: 'doubleLineBreaks',
        pattern: /\n\n/g,
        replacement: '<div class="my-4"></div>',
        priority: 19
      },
      {
        name: 'intentionalWhitespace',
        pattern: /  \n/g,
        replacement: '<br class="my-1">',
        priority: 18
      },
      {
        name: 'lineBreaks',
        pattern: /\n/g,
        replacement: '<br>',
        priority: 10
      }
    );

    return rules;
  }

  /**
   * Process individual table rows
   */
  private processTableRow(match: string, contents: string): string {
    const cells = contents.split('|').map(cell => cell.trim());
    
    // Check if this is a header separator row
    if (cells.every(cell => /^[-:]+$/.test(cell))) {
      return ''; // Remove separator row
    }
    
    return `<tr>${cells.map(cell => `<td class="border px-3 py-2">${cell}</td>`).join('')}</tr>`;
  }

  /**
   * Combine consecutive table rows into proper HTML tables
   */
  private combineTableRows(match: string): string {
    const rows = match.match(/<tr>.+?<\/tr>/gs) || [];
    
    if (rows.length === 0) return match;
    
    const firstRow = rows[0] || '';
    const otherRows = rows.slice(1).join('');
    
    // Check if first row should be a header
    const isHeaderRow = HEADER_KEYWORDS.some(keyword => 
      firstRow.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isHeaderRow) {
      const headerRow = firstRow.replace(/<td/g, '<th class="bg-muted/50 font-semibold py-2 px-3"').replace(/<\/td>/g, '</th>');
      return `<table class="w-full border-collapse my-4 bg-card"><thead>${headerRow}</thead><tbody>${otherRows}</tbody></table>`;
    }
    
    return `<table class="w-full border-collapse my-4 bg-card"><tbody>${rows.join('')}</tbody></table>`;
  }

  /**
   * Combine adjacent table blocks
   */
  private combineAdjacentTables(content: string): string {
    return content.replace(
      /(\|.+\|\n)+\n(\|.+\|\n)+/g, 
      match => match.replace(/\n\n/g, '\n')
    );
  }

  /**
   * Remove duplicate consecutive lines
   */
  private removeDuplicateLines(content: string): string {
    return content.replace(/^(.+)$\n^\1$/gm, '$1');
  }

  /**
   * Final post-processing
   */
  private postProcessContent(content: string): string {
    // Clean up any remaining issues
    return content
      .replace(/(<br\s*\/?>)\s*(<br\s*\/?>)\s*(<br\s*\/?>)+/g, '<div class="my-4"></div>') // Replace multiple <br> with spacing
      .replace(/^\s+|\s+$/g, '') // Trim whitespace
      .replace(/\s{2,}/g, ' ') // Normalize excessive whitespace
      .replace(/(<tr>.+?<\/tr>)(\s*<tr>.+?<\/tr>)+/gs, function(match) {
        // Extract all rows
        const rows = match.match(/<tr>.+?<\/tr>/gs) || [];
        
        if (rows.length === 0) return match;
        
        // Check if first row should be a header
        const firstRow = rows[0] || '';
        const otherRows = rows.slice(1).join('');
        
        // If there's a clear header row (e.g., Exercise, Sets, Reps)
        if (firstRow.includes('Exercise') || firstRow.includes('Sets') || firstRow.includes('Reps') || 
            firstRow.includes('Day') || firstRow.includes('Focus') || firstRow.includes('Workout')) {
          const headerRow = firstRow
            .replace(/<td/g, '<th class="bg-muted/50 font-semibold py-2 px-3"')
            .replace(/<\/td>/g, '</th>');
          return `<div class="overflow-x-auto max-w-full"><table class="w-full min-w-[400px] border-collapse my-4 bg-card"><thead>${headerRow}</thead><tbody>${otherRows}</tbody></table></div>`;
        }
        
        // Otherwise, treat all rows as body rows
        return `<div class="overflow-x-auto max-w-full"><table class="w-full min-w-[400px] border-collapse my-4 bg-card"><tbody>${rows.join('')}</tbody></table></div>`;
      });
  }
}

// Convenience function for backward compatibility
export function formatMessage(content: string, options?: Partial<ProcessingOptions>): string {
  const formatter = new MessageFormatter(options);
  return formatter.formatMessage(content);
}

// Export types for external use
export type { ProcessingOptions, FormatRule };

