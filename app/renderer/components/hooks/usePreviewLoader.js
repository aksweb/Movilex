// hooks/usePreviewLoader.js

import { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

export function usePreviewLoader(file) {
  const [imageSrc, setImageSrc] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  useEffect(() => {
    if (!file) return;

    let objectUrl = null;
    let cancelled = false;

    const path = file.path || file.original_path;

    const load = async () => {
      const buffer = await window.api.readFile(path);
      if (!buffer || cancelled) return;

      if (/\.(jpg|jpeg|png|gif)$/i.test(path)) {
        objectUrl = URL.createObjectURL(new Blob([buffer]));
        setImageSrc(objectUrl);
        return;
      }

      if (path.endsWith('.pdf')) {
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(buffer)
        }).promise;

        if (!cancelled) setPdfDoc(pdf);
      }
    };

    load();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      setImageSrc(null);
      setPdfDoc(null);
    };
  }, [file]);

  return { imageSrc, pdfDoc };
}