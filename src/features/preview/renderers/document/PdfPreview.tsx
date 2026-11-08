import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface PdfPreviewProps {
  blobUrl?: string;
  base64?: string;
  rawBuffer?: Uint8Array;
  fileName: string;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({
  blobUrl,
  base64,
  fileName,
}) => {
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    if (blobUrl) {
      setObjectUrl(blobUrl);
    } else if (base64) {
      const cleanB64 = base64.replace(/\s+/g, '');
      setObjectUrl(`data:application/pdf;base64,${cleanB64}`);
    }
  }, [blobUrl, base64]);

  if (!objectUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-text-secondary">
        <FileText size={40} className="mb-3 text-text-tertiary opacity-60" />
        <p className="text-sm font-medium text-text-primary">Loading PDF document...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-surface-2/30">
      <div className="flex-1 w-full h-full relative">
        <object
          data={`${objectUrl}#toolbar=1&navpanes=0`}
          type="application/pdf"
          className="w-full h-full border-none"
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
            <FileText size={44} className="mb-3 text-text-tertiary opacity-70" />
            <p className="text-sm font-semibold text-text-primary">PDF Document: {fileName}</p>
            <p className="text-xs text-text-secondary mt-1 mb-4 max-w-sm">
              Your browser does not support inline PDF embedding.
            </p>
            <a
              href={objectUrl}
              download={fileName}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg text-xs font-medium hover:opacity-95 transition-opacity"
            >
              <Download size={14} /> Download PDF
            </a>
          </div>
        </object>
      </div>
    </div>
  );
};
