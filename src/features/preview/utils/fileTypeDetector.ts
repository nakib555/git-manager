import { FileFormatInfo, PreviewCategory } from '../types/previewTypes';

const EXTENSION_MAP: Record<string, Partial<FileFormatInfo>> = {
  // Images
  png: { category: 'image', mimeType: 'image/png', displayName: 'PNG Image', isBinary: true },
  jpg: { category: 'image', mimeType: 'image/jpeg', displayName: 'JPEG Image', isBinary: true },
  jpeg: { category: 'image', mimeType: 'image/jpeg', displayName: 'JPEG Image', isBinary: true },
  gif: { category: 'image', mimeType: 'image/gif', displayName: 'GIF Animation', isBinary: true },
  webp: { category: 'image', mimeType: 'image/webp', displayName: 'WebP Image', isBinary: true },
  svg: { category: 'image', mimeType: 'image/svg+xml', displayName: 'SVG Vector Image', isBinary: false, canCopyText: true },
  bmp: { category: 'image', mimeType: 'image/bmp', displayName: 'Bitmap Image', isBinary: true },
  ico: { category: 'image', mimeType: 'image/x-icon', displayName: 'Icon', isBinary: true },
  avif: { category: 'image', mimeType: 'image/avif', displayName: 'AVIF Image', isBinary: true },
  heic: { category: 'image', mimeType: 'image/heic', displayName: 'HEIC Photo', isBinary: true },
  heif: { category: 'image', mimeType: 'image/heif', displayName: 'HEIF Photo', isBinary: true },
  tif: { category: 'image', mimeType: 'image/tiff', displayName: 'TIFF Image', isBinary: true },
  tiff: { category: 'image', mimeType: 'image/tiff', displayName: 'TIFF Image', isBinary: true },
  psd: { category: 'image', mimeType: 'image/vnd.adobe.photoshop', displayName: 'Photoshop PSD', isBinary: true },

  // Documents
  pdf: { category: 'pdf', mimeType: 'application/pdf', displayName: 'PDF Document', isBinary: true },
  docx: { category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', displayName: 'Word Document', isBinary: true },
  doc: { category: 'document', mimeType: 'application/msword', displayName: 'Word Document (Legacy)', isBinary: true },
  pptx: { category: 'document', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', displayName: 'PowerPoint Presentation', isBinary: true },
  ppt: { category: 'document', mimeType: 'application/vnd.ms-powerpoint', displayName: 'PowerPoint Presentation (Legacy)', isBinary: true },
  odt: { category: 'document', mimeType: 'application/vnd.oasis.opendocument.text', displayName: 'OpenDocument Text', isBinary: true },
  rtf: { category: 'document', mimeType: 'application/rtf', displayName: 'Rich Text Format', isBinary: false, canCopyText: true },

  // Spreadsheets & Data
  xlsx: { category: 'spreadsheet', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', displayName: 'Excel Spreadsheet', isBinary: true },
  xls: { category: 'spreadsheet', mimeType: 'application/vnd.ms-excel', displayName: 'Excel Spreadsheet (Legacy)', isBinary: true },
  xlsm: { category: 'spreadsheet', mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12', displayName: 'Excel Macro Spreadsheet', isBinary: true },
  ods: { category: 'spreadsheet', mimeType: 'application/vnd.oasis.opendocument.spreadsheet', displayName: 'OpenDocument Spreadsheet', isBinary: true },
  csv: { category: 'spreadsheet', mimeType: 'text/csv', displayName: 'Comma-Separated Values', isBinary: false, canCopyText: true, canSearch: true },
  tsv: { category: 'spreadsheet', mimeType: 'text/tab-separated-values', displayName: 'Tab-Separated Values', isBinary: false, canCopyText: true, canSearch: true },
  json: { category: 'data', mimeType: 'application/json', displayName: 'JSON Data', isBinary: false, canCopyText: true, canSearch: true },
  jsonc: { category: 'data', mimeType: 'application/json', displayName: 'JSON with Comments', isBinary: false, canCopyText: true, canSearch: true },
  xml: { category: 'data', mimeType: 'application/xml', displayName: 'XML Document', isBinary: false, canCopyText: true, canSearch: true },
  yaml: { category: 'code', mimeType: 'text/yaml', displayName: 'YAML Configuration', isBinary: false, canCopyText: true, canSearch: true },
  yml: { category: 'code', mimeType: 'text/yaml', displayName: 'YAML Configuration', isBinary: false, canCopyText: true, canSearch: true },
  toml: { category: 'code', mimeType: 'text/toml', displayName: 'TOML Configuration', isBinary: false, canCopyText: true, canSearch: true },

  // Markdown & Text
  md: { category: 'markdown', mimeType: 'text/markdown', displayName: 'Markdown Document', isBinary: false, canCopyText: true, canSearch: true },
  mdx: { category: 'markdown', mimeType: 'text/mdx', displayName: 'MDX Document', isBinary: false, canCopyText: true, canSearch: true },
  txt: { category: 'code', mimeType: 'text/plain', displayName: 'Plain Text', isBinary: false, canCopyText: true, canSearch: true },
  log: { category: 'code', mimeType: 'text/plain', displayName: 'Log File', isBinary: false, canCopyText: true, canSearch: true },

  // Source Code
  js: { category: 'code', mimeType: 'text/javascript', displayName: 'JavaScript Source', isBinary: false, canCopyText: true, canSearch: true },
  mjs: { category: 'code', mimeType: 'text/javascript', displayName: 'JavaScript Module', isBinary: false, canCopyText: true, canSearch: true },
  cjs: { category: 'code', mimeType: 'text/javascript', displayName: 'CommonJS Script', isBinary: false, canCopyText: true, canSearch: true },
  ts: { category: 'code', mimeType: 'text/typescript', displayName: 'TypeScript Source', isBinary: false, canCopyText: true, canSearch: true },
  tsx: { category: 'code', mimeType: 'text/tsx', displayName: 'TypeScript React JSX', isBinary: false, canCopyText: true, canSearch: true },
  jsx: { category: 'code', mimeType: 'text/jsx', displayName: 'JavaScript React JSX', isBinary: false, canCopyText: true, canSearch: true },
  html: { category: 'code', mimeType: 'text/html', displayName: 'HTML Document', isBinary: false, canCopyText: true, canSearch: true },
  htm: { category: 'code', mimeType: 'text/html', displayName: 'HTML Document', isBinary: false, canCopyText: true, canSearch: true },
  css: { category: 'code', mimeType: 'text/css', displayName: 'CSS Stylesheet', isBinary: false, canCopyText: true, canSearch: true },
  scss: { category: 'code', mimeType: 'text/x-scss', displayName: 'Sass SCSS', isBinary: false, canCopyText: true, canSearch: true },
  sass: { category: 'code', mimeType: 'text/x-sass', displayName: 'Sass Stylesheet', isBinary: false, canCopyText: true, canSearch: true },
  less: { category: 'code', mimeType: 'text/x-less', displayName: 'Less Stylesheet', isBinary: false, canCopyText: true, canSearch: true },
  py: { category: 'code', mimeType: 'text/x-python', displayName: 'Python Script', isBinary: false, canCopyText: true, canSearch: true },
  rs: { category: 'code', mimeType: 'text/rust', displayName: 'Rust Source', isBinary: false, canCopyText: true, canSearch: true },
  go: { category: 'code', mimeType: 'text/x-go', displayName: 'Go Source', isBinary: false, canCopyText: true, canSearch: true },
  java: { category: 'code', mimeType: 'text/x-java', displayName: 'Java Source', isBinary: false, canCopyText: true, canSearch: true },
  kt: { category: 'code', mimeType: 'text/x-kotlin', displayName: 'Kotlin Source', isBinary: false, canCopyText: true, canSearch: true },
  c: { category: 'code', mimeType: 'text/x-c', displayName: 'C Source', isBinary: false, canCopyText: true, canSearch: true },
  cpp: { category: 'code', mimeType: 'text/x-c++', displayName: 'C++ Source', isBinary: false, canCopyText: true, canSearch: true },
  h: { category: 'code', mimeType: 'text/x-c-header', displayName: 'C/C++ Header', isBinary: false, canCopyText: true, canSearch: true },
  cs: { category: 'code', mimeType: 'text/x-csharp', displayName: 'C# Source', isBinary: false, canCopyText: true, canSearch: true },
  rb: { category: 'code', mimeType: 'text/x-ruby', displayName: 'Ruby Script', isBinary: false, canCopyText: true, canSearch: true },
  php: { category: 'code', mimeType: 'text/x-php', displayName: 'PHP Script', isBinary: false, canCopyText: true, canSearch: true },
  swift: { category: 'code', mimeType: 'text/x-swift', displayName: 'Swift Source', isBinary: false, canCopyText: true, canSearch: true },
  dart: { category: 'code', mimeType: 'text/x-dart', displayName: 'Dart Source', isBinary: false, canCopyText: true, canSearch: true },
  sh: { category: 'code', mimeType: 'application/x-sh', displayName: 'Shell Script', isBinary: false, canCopyText: true, canSearch: true },
  bash: { category: 'code', mimeType: 'application/x-sh', displayName: 'Bash Script', isBinary: false, canCopyText: true, canSearch: true },
  zsh: { category: 'code', mimeType: 'application/x-sh', displayName: 'Zsh Script', isBinary: false, canCopyText: true, canSearch: true },
  sql: { category: 'code', mimeType: 'application/sql', displayName: 'SQL Query', isBinary: false, canCopyText: true, canSearch: true },
  graphql: { category: 'code', mimeType: 'application/graphql', displayName: 'GraphQL Schema', isBinary: false, canCopyText: true, canSearch: true },
  gql: { category: 'code', mimeType: 'application/graphql', displayName: 'GraphQL Query', isBinary: false, canCopyText: true, canSearch: true },
  dockerfile: { category: 'code', mimeType: 'text/plain', displayName: 'Dockerfile', isBinary: false, canCopyText: true, canSearch: true },
  makefile: { category: 'code', mimeType: 'text/plain', displayName: 'Makefile', isBinary: false, canCopyText: true, canSearch: true },
  env: { category: 'code', mimeType: 'text/plain', displayName: 'Environment File', isBinary: false, canCopyText: true, canSearch: true },

  // Archives
  zip: { category: 'archive', mimeType: 'application/zip', displayName: 'ZIP Archive', isBinary: true },
  cbz: { category: 'archive', mimeType: 'application/x-cbz', displayName: 'Comic Book ZIP', isBinary: true },
  jar: { category: 'archive', mimeType: 'application/java-archive', displayName: 'Java Archive', isBinary: true },
  tar: { category: 'archive', mimeType: 'application/x-tar', displayName: 'TAR Archive', isBinary: true },
  gz: { category: 'archive', mimeType: 'application/gzip', displayName: 'GZip Archive', isBinary: true },
  tgz: { category: 'archive', mimeType: 'application/gzip', displayName: 'Tarball Archive', isBinary: true },

  // Audio & Video
  mp3: { category: 'audio', mimeType: 'audio/mpeg', displayName: 'MP3 Audio', isBinary: true },
  wav: { category: 'audio', mimeType: 'audio/wav', displayName: 'WAV Audio', isBinary: true },
  ogg: { category: 'audio', mimeType: 'audio/ogg', displayName: 'OGG Audio', isBinary: true },
  flac: { category: 'audio', mimeType: 'audio/flac', displayName: 'FLAC Lossless Audio', isBinary: true },
  aac: { category: 'audio', mimeType: 'audio/aac', displayName: 'AAC Audio', isBinary: true },
  m4a: { category: 'audio', mimeType: 'audio/m4a', displayName: 'M4A Audio', isBinary: true },
  opus: { category: 'audio', mimeType: 'audio/opus', displayName: 'Opus Audio', isBinary: true },
  mp4: { category: 'video', mimeType: 'video/mp4', displayName: 'MP4 Video', isBinary: true },
  webm: { category: 'video', mimeType: 'video/webm', displayName: 'WebM Video', isBinary: true },
  mov: { category: 'video', mimeType: 'video/quicktime', displayName: 'QuickTime Movie', isBinary: true },
  mkv: { category: 'video', mimeType: 'video/x-matroska', displayName: 'Matroska Video', isBinary: true },
  m4v: { category: 'video', mimeType: 'video/x-m4v', displayName: 'M4V Video', isBinary: true },

  // Fonts
  ttf: { category: 'font', mimeType: 'font/ttf', displayName: 'TrueType Font', isBinary: true },
  otf: { category: 'font', mimeType: 'font/otf', displayName: 'OpenType Font', isBinary: true },
  woff: { category: 'font', mimeType: 'font/woff', displayName: 'Web Open Font (WOFF)', isBinary: true },
  woff2: { category: 'font', mimeType: 'font/woff2', displayName: 'Web Open Font 2 (WOFF2)', isBinary: true },

  // 3D Models
  gltf: { category: '3d', mimeType: 'model/gltf+json', displayName: 'glTF 3D Model', isBinary: false, canCopyText: true },
  glb: { category: '3d', mimeType: 'model/gltf-binary', displayName: 'Binary glTF 3D Model', isBinary: true },
  obj: { category: '3d', mimeType: 'model/obj', displayName: 'Wavefront 3D OBJ', isBinary: false, canCopyText: true },
  stl: { category: '3d', mimeType: 'model/stl', displayName: 'Stereolithography 3D STL', isBinary: true },

  // Databases & Binary
  sqlite: { category: 'sqlite', mimeType: 'application/vnd.sqlite3', displayName: 'SQLite Database', isBinary: true },
  sqlite3: { category: 'sqlite', mimeType: 'application/vnd.sqlite3', displayName: 'SQLite Database', isBinary: true },
  db: { category: 'sqlite', mimeType: 'application/x-sqlite3', displayName: 'Database File', isBinary: true },
  wasm: { category: 'binary', mimeType: 'application/wasm', displayName: 'WebAssembly Binary', isBinary: true },
  exe: { category: 'binary', mimeType: 'application/x-msdownload', displayName: 'Windows Executable', isBinary: true },
  dll: { category: 'binary', mimeType: 'application/x-msdownload', displayName: 'Dynamic Link Library', isBinary: true },
  bin: { category: 'binary', mimeType: 'application/octet-stream', displayName: 'Binary Data', isBinary: true },
  dat: { category: 'binary', mimeType: 'application/octet-stream', displayName: 'Data File', isBinary: true },
};

export function detectFileType(filePath: string): FileFormatInfo {
  const normalized = (filePath || '').trim().toLowerCase();
  const fileName = normalized.split('/').pop() || '';

  // Special full filenames
  if (fileName === 'dockerfile') {
    return { category: 'code', mimeType: 'text/plain', extension: 'dockerfile', displayName: 'Dockerfile', isBinary: false, canCopyText: true, canSearch: true };
  }
  if (fileName === 'makefile') {
    return { category: 'code', mimeType: 'text/plain', extension: 'makefile', displayName: 'Makefile', isBinary: false, canCopyText: true, canSearch: true };
  }
  if (fileName.startsWith('.env')) {
    return { category: 'code', mimeType: 'text/plain', extension: 'env', displayName: 'Environment Configuration', isBinary: false, canCopyText: true, canSearch: true };
  }
  if (fileName.startsWith('.git')) {
    return { category: 'code', mimeType: 'text/plain', extension: 'git', displayName: 'Git Configuration', isBinary: false, canCopyText: true, canSearch: true };
  }

  const ext = fileName.includes('.') ? fileName.split('.').pop() || '' : '';
  const match = EXTENSION_MAP[ext];

  if (match) {
    return {
      category: match.category || 'code',
      mimeType: match.mimeType || 'text/plain',
      extension: ext,
      displayName: match.displayName || ext.toUpperCase(),
      isBinary: !!match.isBinary,
      canCopyText: match.canCopyText ?? !match.isBinary,
      canSearch: match.canSearch ?? !match.isBinary,
    };
  }

  // Fallback heuristic: check if unknown extension
  return {
    category: ext ? 'binary' : 'code',
    mimeType: 'application/octet-stream',
    extension: ext,
    displayName: ext ? `${ext.toUpperCase()} File` : 'Plain File',
    isBinary: ext ? true : false,
    canCopyText: !ext,
    canSearch: !ext,
  };
}
