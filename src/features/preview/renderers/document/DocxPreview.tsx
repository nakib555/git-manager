import React, { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import { FileText, AlertCircle } from 'lucide-react';

interface DocxPreviewProps {
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({ rawBuffer, fileName }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawBuffer || rawBuffer.length === 0) {
      setError('Document buffer is empty.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Mammoth expects ArrayBuffer
    const arrayBuffer = rawBuffer.buffer.slice(
      rawBuffer.byteOffset,
      rawBuffer.byteOffset + rawBuffer.byteLength
    ) as ArrayBuffer;

    mammoth
      .convertToHtml({ arrayBuffer })
      .then((result) => {
        if (!isMounted) return;
        setHtmlContent(result.value || '<p>Document has no readable text.</p>');
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to parse DOCX document');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [rawBuffer]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-text-secondary">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs">Parsing Word document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <AlertCircle size={40} className="text-rose-500 mb-3 opacity-80" />
        <p className="text-sm font-medium text-text-primary">Unable to render Word document</p>
        <p className="text-xs text-text-tertiary mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto p-4 md:p-8 bg-surface-2/40 flex justify-center">
      <div className="w-full max-w-3xl bg-surface-1 border border-border rounded-xl p-8 md:p-12 shadow-soft min-h-[600px] text-text-primary prose prose-slate max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          className="[&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mt-6 [&>h2]:mb-3 [&>p]:leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ol]:list-decimal [&>ol]:pl-5 [&>table]:w-full [&>table]:border-collapse [&>table_td]:border [&>table_td]:border-border [&>table_td]:p-2 [&>table_th]:border [&>table_th]:border-border [&>table_th]:p-2 [&>table_th]:bg-surface-2"
        />
      </div>
    </div>
  );
};
