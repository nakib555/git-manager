import React, { useState, useEffect } from 'react';
import { Type } from 'lucide-react';

interface FontPreviewProps {
  blobUrl?: string;
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const FontPreview: React.FC<FontPreviewProps> = ({ blobUrl, rawBuffer, fileName }) => {
  const [fontSize, setFontSize] = useState(36);
  const [sampleText, setSampleText] = useState('The quick brown fox jumps over the lazy dog 1234567890');
  const [fontFamilyName, setFontFamilyName] = useState<string>('');

  useEffect(() => {
    const fontName = `custom-font-${Date.now()}`;
    let srcUrl = blobUrl;

    if (!srcUrl && rawBuffer) {
      const blob = new Blob([rawBuffer], { type: 'font/ttf' });
      srcUrl = URL.createObjectURL(blob);
    }

    if (!srcUrl) return;

    const fontFace = new FontFace(fontName, `url(${srcUrl})`);
    fontFace.load().then((loadedFace) => {
      document.fonts.add(loadedFace);
      setFontFamilyName(fontName);
    }).catch(() => {
      // Fallback
    });

    return () => {
      if (fontFace) {
        document.fonts.delete(fontFace);
      }
    };
  }, [blobUrl, rawBuffer]);

  return (
    <div className="w-full h-full flex flex-col bg-surface-1 overflow-hidden">
      <div className="p-4 border-b border-border bg-surface-2/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <Type size={18} className="text-accent" />
          <span className="text-xs font-semibold text-text-primary">{fileName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-tertiary">Size:</span>
          <input
            type="range"
            min={12}
            max={72}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-28 accent-accent h-1.5 bg-surface-3 rounded cursor-pointer"
          />
          <span className="text-xs font-mono text-text-secondary tabular-nums w-8">{fontSize}px</span>
        </div>
      </div>

      <div className="p-4 border-b border-border bg-surface-1 shrink-0">
        <input
          type="text"
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          placeholder="Type custom text to preview font..."
          className="w-full px-3 py-1.5 text-xs bg-surface-2 border border-border rounded-lg text-text-primary outline-none focus:border-accent"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
        <div>
          <div className="text-[11px] font-mono text-text-tertiary mb-2">Live Rendering Preview:</div>
          <div
            style={{ fontFamily: fontFamilyName || 'sans-serif', fontSize: `${fontSize}px` }}
            className="text-text-primary leading-tight break-words py-2 select-text"
          >
            {sampleText}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <div className="text-[11px] font-mono text-text-tertiary mb-3">Character Matrix:</div>
          <div
            style={{ fontFamily: fontFamilyName || 'sans-serif' }}
            className="text-xl grid grid-cols-8 md:grid-cols-12 gap-2 text-center text-text-primary p-4 bg-surface-2/30 rounded-xl border border-border select-text"
          >
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'.split('').map((char, i) => (
              <span key={i} className="p-2 hover:bg-surface-2 rounded transition-colors">{char}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
