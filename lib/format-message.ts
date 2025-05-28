/**
 * Formats message content with enhanced markdown-like syntax
 */
export function formatMessage(content: string): string {
  if (!content) return '';

  // Process the content with various formatting rules
  return (
    content
      // Bold text: **text** -> <strong>text</strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

      // Italic text: *text* -> <em>text</em>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')

      // Lists: - item -> <li>item</li>
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/<li>(.+)<\/li>(\n<li>)/g, '<li>$1</li><ul>$2')
      .replace(/(<\/li>\n)(?!<li>)/g, '$1</ul>')

      // Headers: # Header -> <h3>Header</h3>
      .replace(/^# (.+)$/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')

      // Subheaders: ## Header -> <h4>Header</h4>
      .replace(/^## (.+)$/gm, '<h4 class="text-md font-semibold my-1">$1</h4>')

      // Line breaks: \n -> <br>
      .replace(/\n/g, '<br>')
  );
}
