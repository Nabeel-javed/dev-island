import type { github } from './github';

export type RepositoryOverview = {
  status: 'available' | 'partial' | 'unavailable';
  summary: string;
  inference: boolean;
  evidence: { fact: string; path: string; url: string }[];
  limitations: string;
};
const MANIFESTS = [
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'Cargo.toml',
  'go.mod',
  'foundry.toml',
];
const LIMIT = 48_000;
const frameworkRules = [
  ['next', 'Next.js', 'a web application'],
  ['express', 'Express', 'a JavaScript web server or API'],
  ['fastify', 'Fastify', 'a JavaScript web server or API'],
  ['react-native', 'React Native', 'a mobile application'],
  ['electron', 'Electron', 'a desktop application'],
  ['@angular/core', 'Angular', 'a web application'],
  ['vue', 'Vue', 'a web interface'],
  ['react', 'React', 'a web interface or component library'],
] as const;
const validPath = (p: string) =>
  /^[a-zA-Z0-9._/-]{1,160}$/.test(p) && !p.split('/').some((s) => s === '..' || s === '.');

/** Static, bounded inspection. Repository text is data, never executed or followed as instructions. */
export function describeRepository(
  entries: { path: string; type: string }[],
  files: Record<string, string>,
  base: string,
  branch: string,
  partial = false,
): RepositoryOverview {
  const evidence: RepositoryOverview['evidence'] = [];
  const add = (fact: string, path: string, dir = false) => {
    evidence.push({
      fact,
      path,
      url: `${base}/${dir ? 'tree' : 'blob'}/${encodeURIComponent(branch)}/${path.split('/').map(encodeURIComponent).join('/')}`,
    });
  };
  let purpose = '';
  const packageText = files['package.json'];
  if (packageText) {
    try {
      const pkg = JSON.parse(packageText);
      const dependencies = Object.keys(
        pkg.dependencies && typeof pkg.dependencies === 'object' ? pkg.dependencies : {},
      );
      for (const [key, label, kind] of frameworkRules) {
        if (dependencies.includes(key)) {
          add(`Declares ${label} as a runtime dependency.`, 'package.json');
          if (!purpose) purpose = kind + ` using ${label}`;
        }
      }
      if (pkg.bin && (typeof pkg.bin === 'string' || typeof pkg.bin === 'object')) {
        add('Declares a command-line executable.', 'package.json');
        if (!purpose) purpose = 'a command-line tool';
      }
      const scripts = Object.keys(pkg.scripts && typeof pkg.scripts === 'object' ? pkg.scripts : {})
        .filter((k) => /^[a-zA-Z0-9:_-]{1,32}$/.test(k))
        .slice(0, 6);
      if (scripts.length) add(`Defines these task names: ${scripts.join(', ')}.`, 'package.json');
      if (!purpose)
        add(
          'Contains a JavaScript package manifest; that alone does not establish what the project does.',
          'package.json',
        );
    } catch {
      partial = true;
    }
  }
  for (const path of ['requirements.txt', 'pyproject.toml']) {
    const content = files[path];
    if (!content) continue;
    for (const [dependency, label, kind] of [
      ['fastapi', 'FastAPI', 'a Python web API'],
      ['django', 'Django', 'a Python web application'],
      ['flask', 'Flask', 'a Python web application'],
    ] as const) {
      // Match dependency declarations, not prose, comments, URLs or arbitrary source strings.
      const pattern =
        path === 'requirements.txt'
          ? new RegExp(`^\\s*${dependency}(?:\\[|[<>=!~;\\s]|$)`, 'im')
          : new RegExp(
              `^\\s*(?:["']${dependency}(?:[<>=!~\\[;][^"']*)?["']\\s*[,]?$|${dependency}\\s*=)`,
              'im',
            );
      if (pattern.test(content)) {
        add(`Lists ${label} in its Python dependency configuration.`, path);
        if (!purpose) purpose = kind;
      }
    }
    add('Contains Python dependency configuration.', path);
  }
  for (const [path, fact] of [
    ['Cargo.toml', 'Contains a Rust package manifest.'],
    ['go.mod', 'Contains a Go module definition.'],
    ['foundry.toml', 'Contains Foundry configuration, commonly used for Solidity development.'],
  ])
    if (files[path]) add(fact, path);
  for (const entry of entries) {
    if (entry.type !== 'file') continue;
    if (entry.path === 'index.html') {
      add('Contains a root HTML page, which browsers can display.', entry.path);
      if (!purpose) purpose = 'a static website or browser demo';
    }
    if (entry.path === 'Dockerfile')
      add('Includes container build instructions; they have not been run.', entry.path);
    if (entry.path === 'main.py')
      add('Contains a Python file named main.py, a possible starting point to read.', entry.path);
  }
  for (const entry of entries) {
    if (!validPath(entry.path) || entry.type !== 'dir') continue;
    const labels: Record<string, string> = {
      src: 'Has a source-code directory.',
      app: 'Has an app directory.',
      pages: 'Has a pages directory.',
      tests: 'Has a tests directory; test results have not been checked.',
      test: 'Has a test directory; test results have not been checked.',
      docs: 'Has a documentation directory.',
      contracts: 'Has a contracts directory.',
      examples: 'Has an examples directory.',
    };
    if (labels[entry.path]) add(labels[entry.path], entry.path, true);
  }
  return {
    status: partial ? 'partial' : 'available',
    summary: purpose
      ? `The inspected configuration suggests ${purpose}.`
      : 'The available files do not establish the purpose of this repository.',
    inference: !!purpose,
    evidence: evidence.slice(0, 10),
    limitations:
      'Based on selected root files and folders, not a full code review. Dependencies describe tooling, not proof of working features. The intended use, behavior and author’s contribution may need explanation from the owner.',
  };
}
export async function inspectRepository(
  path: string,
  owner: string,
  name: string,
  branch: string,
  request: typeof github,
): Promise<RepositoryOverview> {
  const base = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
  const unavailable: RepositoryOverview = {
    status: 'unavailable',
    summary: 'Repository files could not be inspected right now.',
    inference: false,
    evidence: [],
    limitations: 'Try again later or open the repository on GitHub. No purpose has been inferred.',
  };
  try {
    const root = await request(`${path}/contents?ref=${encodeURIComponent(branch)}`);
    if (!Array.isArray(root)) return unavailable;
    const entries = root
      .slice(0, 120)
      .filter((e) => typeof e.path === 'string' && validPath(e.path));
    const selected = entries
      .filter(
        (e) =>
          e.type === 'file' &&
          MANIFESTS.includes(e.path) &&
          typeof e.size === 'number' &&
          e.size <= LIMIT,
      )
      .slice(0, 3);
    let partial =
      root.length > 120 || entries.some((e) => MANIFESTS.includes(e.path) && !selected.includes(e));
    const results = await Promise.allSettled(
      selected.map(async (e) => {
        const data = await request(
          `${path}/contents/${encodeURIComponent(e.path)}?ref=${encodeURIComponent(branch)}`,
        );
        if (
          data.type !== 'file' ||
          data.encoding !== 'base64' ||
          typeof data.content !== 'string' ||
          data.content.length > LIMIT * 1.4 ||
          data.size > LIMIT
        )
          throw new Error('Unsupported manifest');
        const text = Buffer.from(data.content, 'base64').toString('utf8');
        if (Buffer.byteLength(text) > LIMIT) throw new Error('Manifest too large');
        return [e.path, text] as const;
      }),
    );
    const files: Record<string, string> = {};
    results.forEach((r) => {
      if (r.status === 'fulfilled') files[r.value[0]] = r.value[1];
      else partial = true;
    });
    return describeRepository(entries, files, base, branch, partial);
  } catch {
    return unavailable;
  }
}
