/**
 * Utility to parse basic Markdown text to formatted HTML strings
 * Handles **bold**, *italic*, <u>underline</u>, headings, lists, blockquotes, and code blocks
 */
export const parseMarkdownToHtml = (markdownText) => {
  if (!markdownText) return '';

  let html = markdownText;

  // Escape HTML tags except <u> and </u>
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, (match, offset, fullText) => {
      if (fullText.substring(offset, offset + 3) === '<u>' || fullText.substring(offset, offset + 4) === '</u>') {
        return '<';
      }
      return '&lt;';
    })
    .replace(/>/g, (match, offset, fullText) => {
      if (fullText.substring(offset - 2, offset + 1) === '<u>' || fullText.substring(offset - 3, offset + 1) === '</u>') {
        return '>';
      }
      return '&gt;';
    });

  // Headings
  html = html
    .replace(/^### (.*$)/gim, '<h3 className="text-sm font-extrabold text-[#2D2424] my-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 className="text-base font-extrabold text-[#2D2424] my-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 className="text-lg font-extrabold text-[#2D2424] my-2">$1</h1>');

  // Bold (**text** or __text__)
  html = html.replace(/(\*\*|__)(.*?)\1/g, '<strong class="font-black text-[#2D2424]">$2</strong>');

  // Italic (*text* or _text_)
  html = html.replace(/(\*|_)(.*?)\1/g, '<em class="italic">$2</em>');

  // Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-[#FF5CA8] border border-gray-300 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

  // Blockquotes (> text)
  html = html.replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-[#FF8F7E] pl-3 italic text-xs font-semibold bg-[#FFF4E6] p-2 rounded-r-xl my-2">$1</blockquote>');

  // Unordered Lists (- text or * text)
  html = html.replace(/^[\-\*] (.*$)/gim, '<li class="ml-5 list-disc text-xs font-semibold text-[#2D2424]">$1</li>');

  // Wrap contiguous <li> in <ul>
  html = html.replace(/(<li.*<\/li>\s*)+/g, '<ul class="space-y-1 my-2">$&</ul>');

  // Newlines to <br />
  html = html.replace(/\n/g, '<br />');

  return html;
};
