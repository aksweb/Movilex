import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function PreviewPane({ file }) {
  const containerRef = useRef();

  const [imageSrc, setImageSrc] = useState(null);
  const [scale, setScale] = useState(null); // null = fit
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pages, setPages] = useState([]);


  // ---------- RESET ON FILE CHANGE ----------
  useEffect(() => {
    setScale(null);
    setImageSrc(null);
    setPdfDoc(null);
    setPages([]);
  }, [file]);

  // ---------- LOAD FILE ----------
  useEffect(() => {
    if (!file) return;

    const path = file.path || file.original_path;

    const loadFile = async () => {
      const buffer = await window.api.readFile(path);
      if (!buffer) return;

      // IMAGE
      if (/\.(jpg|jpeg|png|gif)$/i.test(path)) {
        const blob = new Blob([buffer]);
        const url = URL.createObjectURL(blob);
        setImageSrc(url);
      }

      // PDF
      if (path.endsWith('.pdf')) {
        const uint8Array = new Uint8Array(buffer);
        const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
        setPdfDoc(pdf);
      }
    };

    loadFile();

    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [file]);

  // ---------- PREPARE PDF PAGES ----------
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return;

    const preparePages = async () => {
      // wait for layout
      await new Promise(r => setTimeout(r, 0));

      const container = containerRef.current;
      const width = container.clientWidth;

      const result = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);

        const baseViewport = page.getViewport({ scale: 1 });
        const fitScale = width / baseViewport.width;

        const finalScale = scale === null ? fitScale : scale;

        const viewport = page.getViewport({ scale: finalScale });

        result.push({ page, viewport });
      }

      setPages(result);
    };

    preparePages();
  }, [pdfDoc, scale]);

  // ---------- PDF PAGE COMPONENT ----------
  const PDFPage = ({ page, viewport }) => {
    const canvasRef = useRef();

    useEffect(() => {
      const render = async () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport
        }).promise;
      };

      render();
    }, [page, viewport]);

    return (
      <canvas
        ref={canvasRef}
        style={{ marginBottom: 12,  }}
      />
    );
  };

  // ---------- CONTROLS ----------
  const Controls = (
    <div style={{ marginBottom: 10 }}>
      <button onClick={() => setScale(s => (s ?? 1) + 0.2)}>+</button>

      <button onClick={() => setScale(s => Math.max(0.2, (s ?? 1) - 0.2))}>
        -
      </button>

      <button onClick={() => setScale(null)}>Fit</button>
    </div>
  );

  if (!file) {
    return <div style={{ padding: 20 }}>No file selected</div>;
  }

  const path = file.path || file.original_path;

  // ---------- IMAGE ----------
  if (/\.(jpg|jpeg|png|gif)$/i.test(path)) {
    const finalScale = scale ?? 1;
    //FITTING TEMPORARY FIX
    return (
      <div ref={containerRef}
        style={{ padding: 10, overflow: 'auto', height: '100%' }}>
        {Controls}
        {imageSrc && ( 
          <img
            src={imageSrc}
            style={{
              width: '100%',
              height: 'auto',
              transform: `scale(${finalScale})`,
              transformOrigin: 'top left'
            }}
            />
        )}
      </div>
    );
  }

  // ---------- PDF ----------
  if (path.endsWith('.pdf')) {
    return (
      <div
        ref={containerRef}
        style={{ padding: 10, overflow: 'auto', height: '100%' }}
      >
        {Controls}

        {pages.map((p, i) => (
          <PDFPage key={i} page={p.page} viewport={p.viewport} />
        ))}
      </div>
    );
  }

  return <div style={{ padding: 20 }}>Preview not supported</div>;
}

export default PreviewPane;