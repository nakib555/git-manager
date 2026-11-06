export const DEMO_FILES = [
  { name: 'src', type: 'dir', isCurrent: false },
  { name: 'src/core', type: 'dir', isCurrent: false },
  { name: 'src/core/vdom.ts', type: 'file', isCurrent: true, size: 2420, lines: 72 },
  { name: 'src/core/fiber.ts', type: 'file', isCurrent: false, size: 3840, lines: 118 },
  { name: 'src/core/signals.ts', type: 'file', isCurrent: false, size: 2960, lines: 84 },
  { name: 'src/server', type: 'dir', isCurrent: false },
  { name: 'src/server/stream.ts', type: 'file', isCurrent: true, size: 4120, lines: 142 },
  { name: 'src/server/hydrate.ts', type: 'file', isCurrent: false, size: 1750, lines: 65 },
  { name: 'src/index.ts', type: 'file', isCurrent: true, size: 890, lines: 45 },
  { name: 'package.json', type: 'file', isCurrent: false, size: 1250, lines: 58 },
  { name: 'README.md', type: 'file', isCurrent: true, size: 2480, lines: 96 },
  { name: 'tsconfig.json', type: 'file', isCurrent: false, size: 680, lines: 32 },
];

export const DEMO_FILE_CONTENTS: Record<string, string> = {
  'src/core/vdom.ts': `/**
 * Nexus Virtual DOM Core Reconciliation Engine
 * Copyright (c) 2026 Nexus Systems
 */

export interface VNode {
  type: string | Function;
  props: Record<string, any>;
  children: (VNode | string)[];
  key?: string | number;
}

export function createElement(
  type: string | Function,
  props: Record<string, any> | null,
  ...children: any[]
): VNode {
  return {
    type,
    props: props || {},
    children: children.flat(),
    key: props?.key,
  };
}

export function reconcile(
  parent: HTMLElement,
  oldNode: VNode | null,
  newNode: VNode | null,
  index = 0
): void {
  if (!oldNode && newNode) {
    parent.appendChild(createRealNode(newNode));
  } else if (oldNode && !newNode) {
    const child = parent.childNodes[index];
    if (child) parent.removeChild(child);
  } else if (oldNode && newNode && hasChanged(oldNode, newNode)) {
    const child = parent.childNodes[index];
    if (child) parent.replaceChild(createRealNode(newNode), child);
  }
}

function hasChanged(a: VNode, b: VNode): boolean {
  return (
    typeof a !== typeof b ||
    (typeof a === 'string' && a !== b) ||
    a.type !== b.type ||
    a.key !== b.key
  );
}

function createRealNode(node: VNode | string): Node {
  if (typeof node === 'string') {
    return document.createTextNode(node);
  }
  const el = document.createElement(node.type as string);
  for (const [key, val] of Object.entries(node.props)) {
    if (key !== 'key') {
      (el as any)[key] = val;
    }
  }
  for (const child of node.children) {
    el.appendChild(createRealNode(child));
  }
  return el;
}
`,
  'src/server/stream.ts': `/**
 * Nexus Streaming SSR Controller
 */

export interface StreamOptions {
  bootstrapScripts?: string[];
  onShellReady?: () => void;
  onError?: (err: unknown) => void;
}

export async function renderToReadableStream(
  element: any,
  options: StreamOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('<!DOCTYPE html><html><head></head><body>'));
      options.onShellReady?.();
      controller.enqueue(encoder.encode('<div id="app"></div>'));
      controller.enqueue(encoder.encode('</body></html>'));
      controller.close();
    },
  });
}
`,
  'src/index.ts': `export * from './core/vdom';
export * from './server/stream';

export const VERSION = '2.4.0';
console.log('Nexus Web Engine initialized v' + VERSION);
`,
  'package.json': `{
  "name": "nexus-web-engine",
  "version": "2.4.0",
  "description": "High-performance reactive rendering engine and virtual DOM compiler",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest run"
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.8.0",
    "vitest": "^2.0.0"
  }
}
`,
  'README.md': `# nexus-web-engine

> High-performance reactive rendering engine and virtual DOM compiler written in TypeScript.
`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
`,
};
