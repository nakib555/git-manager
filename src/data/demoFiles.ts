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
  { name: 'assets', type: 'dir', isCurrent: false },
  { name: 'assets/architecture.svg', type: 'file', isCurrent: true, size: 1850, lines: 45 },
  { name: 'assets/cube_model.gltf', type: 'file', isCurrent: true, size: 3200, lines: 60 },
  { name: 'data', type: 'dir', isCurrent: false },
  { name: 'data/benchmarks.csv', type: 'file', isCurrent: true, size: 1240, lines: 25 },
  { name: 'data/telemetry.json', type: 'file', isCurrent: true, size: 2150, lines: 52 },
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
  'assets/architecture.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
  <rect width="600" height="400" fill="#f7f7f5" rx="16"/>
  <rect x="50" y="40" width="500" height="60" rx="12" fill="#3e5670"/>
  <text x="300" y="75" fill="#ffffff" font-family="system-ui, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Universal File &amp; Image Preview Engine Architecture</text>
  
  <rect x="50" y="140" width="140" height="100" rx="8" fill="#ffffff" stroke="#deddd8" stroke-width="2"/>
  <text x="120" y="180" fill="#1c1d21" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">File Type Detector</text>
  <text x="120" y="205" fill="#8a8d96" font-family="monospace" font-size="10" text-anchor="middle">MIME &amp; Magic Bytes</text>

  <rect x="230" y="140" width="140" height="100" rx="8" fill="#ffffff" stroke="#deddd8" stroke-width="2"/>
  <text x="300" y="180" fill="#1c1d21" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Preview Router</text>
  <text x="300" y="205" fill="#8a8d96" font-family="monospace" font-size="10" text-anchor="middle">Lazy-loaded Chunks</text>

  <rect x="410" y="140" width="140" height="100" rx="8" fill="#ffffff" stroke="#deddd8" stroke-width="2"/>
  <text x="480" y="180" fill="#1c1d21" font-family="system-ui, sans-serif" font-size="13" font-weight="600" text-anchor="middle">Universal Canvas</text>
  <text x="480" y="205" fill="#8a8d96" font-family="monospace" font-size="10" text-anchor="middle">Pan, Zoom, Hex, Raw</text>

  <path d="M 190 190 L 230 190" stroke="#3e5670" stroke-width="2" marker-end="url(#arrow)"/>
  <path d="M 370 190 L 410 190" stroke="#3e5670" stroke-width="2"/>
  
  <rect x="50" y="280" width="500" height="80" rx="8" fill="#efefed" stroke="#deddd8"/>
  <text x="300" y="315" fill="#3e5670" font-family="system-ui, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Supported Domains: Images · Office Docs · PDFs · Audio/Video · Archives · 3D Models · SQLite · Hex</text>
  <text x="300" y="338" fill="#5c5e67" font-family="monospace" font-size="10" text-anchor="middle">Offline Sandboxed Client Decoders &amp; Bounded Memory Protection</text>
</svg>`,
  'data/benchmarks.csv': `Run ID,Operation,Throughput (ops/sec),P99 Latency (ms),Allocated Memory (MB),Status
RUN-001,VDOM Diffing,248500,0.85,14.2,PASS
RUN-002,Fiber Reconciliation,192400,1.12,18.6,PASS
RUN-003,Signal Propagation,640000,0.24,6.4,PASS
RUN-004,SSR Streaming Chunk,88200,2.45,32.1,PASS
RUN-005,Hydration Tree Walk,145000,1.60,22.8,PASS
RUN-006,Batch Reactive Flush,320000,0.48,11.5,PASS
RUN-007,GC Memory Sweep,45000,5.10,8.2,PASS`,
  'data/telemetry.json': `{
  "system": "nexus-web-engine",
  "version": "2.4.0",
  "environment": "production",
  "runtime": {
    "engine": "V8",
    "wasm_support": true,
    "shared_array_buffer": true
  },
  "modules": [
    { "name": "core-vdom", "status": "active", "threads": 4 },
    { "name": "fiber-scheduler", "status": "active", "priority": "high" },
    { "name": "reactive-signals", "status": "nominal", "subscribers": 1420 },
    { "name": "ssr-pipeline", "status": "streaming", "buffer_limit_kb": 2048 }
  ],
  "metrics": {
    "uptime_seconds": 864200,
    "memory_rss_mb": 42.8,
    "heap_used_mb": 28.4,
    "cache_hit_rate": 0.984
  }
}`,
};
