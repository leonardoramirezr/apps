import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.use({ gfm: true, breaks: true });

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
	if (node.tagName === 'A') {
		node.setAttribute('target', '_blank');
		node.setAttribute('rel', 'noopener noreferrer');
	}
});

/** Renders model output as sanitized HTML. The API key lives in this origin, so never skip sanitizing. */
export function renderMarkdown(text: string) {
	return DOMPurify.sanitize(marked.parse(text, { async: false }));
}
