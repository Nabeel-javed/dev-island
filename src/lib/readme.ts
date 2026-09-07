import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toText } from 'hast-util-to-text';
import type { Root, Element } from 'hast';
import type { ProjectDetails } from './project';
import { storyFromSections, type StorySection } from './story';

export const README_LIMIT = 200 * 1024;
export function resolveReadmeUrl(value: string, base: string, image = false) {
  try {
    if (!image && value.startsWith('#'))
      return '#user-content-' + value.slice(1).replace(/^user-content-/, '');
    // GitHub treats a leading slash as relative to the repository root.
    if (value.startsWith('/') && !value.startsWith('//')) {
      const source = new URL(base);
      const root = source.pathname.split('/').slice(0, 5).join('/');
      if (source.hostname === 'github.com' && source.pathname.split('/')[3] === 'blob')
        value = root + value;
    }
    const url = new URL(value, base);
    if (url.protocol !== 'https:' || url.username || url.password) return undefined;
    if (image && url.hostname === 'github.com') {
      const parts = url.pathname.split('/');
      if (parts[3] === 'blob') {
        url.hostname = 'raw.githubusercontent.com';
        parts.splice(3, 1);
        url.pathname = parts.join('/');
        url.search = '';
      }
    }
    return url.href;
  } catch {
    return undefined;
  }
}
export async function renderReadme(
  markdown: string,
  base: string,
): Promise<ProjectDetails['readme']> {
  const bytes = Buffer.from(markdown);
  const truncated = bytes.length > README_LIMIT;
  const input = bytes.subarray(0, README_LIMIT).toString('utf8');
  const parser = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw);
  const raw = await parser.run(parser.parse(input));
  const slugs = new Map<string, number>();
  visit(raw, 'element', (node: Element) => {
    if (/^h[1-6]$/.test(node.tagName)) {
      const slug = toText(node)
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s_-]/gu, '')
        .replace(/\s/g, '-');
      const count = slugs.get(slug) || 0;
      slugs.set(slug, count + 1);
      node.properties.id = slug + (count ? '-' + count : '');
    }
  });
  const tree = (await unified().use(rehypeSanitize).run(raw)) as Root;
  const images: { src: string; alt: string }[] = [];
  visit(tree, 'element', (node: Element) => {
    if (node.tagName === 'a') {
      const href = resolveReadmeUrl(String(node.properties.href || ''), base);
      node.properties = href
        ? {
            ...node.properties,
            href,
            ...(href.startsWith('#') ? {} : { target: '_blank', rel: ['noopener', 'noreferrer'] }),
          }
        : {};
    }
    if (node.tagName === 'img') {
      const src = resolveReadmeUrl(String(node.properties.src || ''), base, true);
      node.properties = {
        alt: node.properties.alt || 'README image',
        ...(src ? { src, loading: 'lazy', referrerPolicy: 'no-referrer' } : {}),
      };
      if (
        src &&
        images.length < 6 &&
        !images.some((i) => i.src === src) &&
        !/shields\.io|\/badge[/-]|badge\.svg/i.test(src)
      )
        images.push({ src, alt: String(node.properties.alt) });
    }
  });
  const sections: StorySection[] = [];
  let section: StorySection | undefined;
  for (const node of tree.children) {
    if (node.type !== 'element') continue;
    if (/^h[1-6]$/.test(node.tagName)) {
      section = { heading: toText(node), text: '' };
      sections.push(section);
    } else if (
      section &&
      section.text.length < 1000 &&
      ['p', 'ul', 'ol', 'blockquote'].includes(node.tagName)
    ) {
      section.text += toText(node).trim() + '\n';
    }
  }
  const paragraphs: string[] = [];
  let features = '';
  let collecting = false;
  for (const node of tree.children) {
    if (node.type !== 'element') continue;
    if (/^h[1-6]$/.test(node.tagName)) {
      if (collecting) break;
      collecting = /^(?:key\s+)?features|^highlights/i.test(toText(node).trim());
      continue;
    }
    const text = toText(node).trim();
    if (collecting && text) features += text + '\n';
    else if (node.tagName === 'p' && text && paragraphs.join(' ').length < 1200)
      paragraphs.push(text);
  }
  return {
    status: 'available',
    html: String(unified().use(rehypeStringify).stringify(tree)),
    story: storyFromSections(sections),
    introduction: paragraphs.join('\n\n').slice(0, 1200),
    features: features.slice(0, 2000).trim(),
    images,
    url: base,
    truncated,
  };
}
