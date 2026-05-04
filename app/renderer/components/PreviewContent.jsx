import React, { useEffect, useState } from 'react';
import PDFPage from './PDFPage';

export default function PreviewContent({
  containerRef,
  imageSrc,
  pdfDoc,
  zoom,
  renderScale,
  file
}) {
  const [pages, setPages] = useState([]);

  const path = file?.path || file?.original_path || '';

  const isImage = /\.(jpg|jpeg|png|gif)$/i.test(path);
  const isPDF = /\.pdf$/i.test(path);

  // ---------- RESET ----------
  useEffect(() => {
    setPages([]);
  }, [file]);

  // ---------- PDF RENDER ----------
  useEffect(() => {
    if (!pdfDoc || !containerRef.current || !isPDF) return;

    let cancelled = false;

    const render = async () => {
      const width = containerRef.current.clientWidth || 800;
      const result = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        if (cancelled) return;

        const base = page.getViewport({ scale: 1 });
        const fit = width / base.width;

        const viewport = page.getViewport({
          scale: fit * renderScale
        });

        result.push({ page, viewport });
      }

      if (!cancelled) setPages(result);
    };

    render();

    return () => { cancelled = true; };
  }, [pdfDoc, renderScale, file]);

  // ---------- RENDER (NO EARLY RETURNS ABOVE HOOKS) ----------

  let content = null;

  // unsupported
  if (!isImage && !isPDF) {
    content = (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9aa0a6',
          fontSize: 14
        }}
      >
        Cant open this. Use default viewer.
      </div>
    );
  }

  // loading states
  else if (isImage && !imageSrc) {
    content = <div style={{ padding: 20 }}>Loading image...</div>;
  }
  else if (isPDF && !pdfDoc) {
    content = <div style={{ padding: 20 }}>Loading PDF...</div>;
  }

  // image
  else if (isImage) {
    content = (
      <div
        style={{
          padding: 10,
          transform: `scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        <img src={imageSrc} style={{ maxWidth: '100%' }} />
      </div>
    );
  }

  // pdf
  else if (isPDF) {
    content = (
      <div
        style={{
          padding: 10,
          transform: `scale(${zoom / renderScale})`,
          transformOrigin: '0 0'
        }}
      >
        {pages.map((p, i) => (
          <PDFPage key={i} page={p.page} viewport={p.viewport} />
        ))}
      </div>
    );
  }

  return content;
}

// -----------------------------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import PDFPage from './PDFPage';
// export default function PreviewContent({
//   containerRef,
//   imageSrc,
//   pdfDoc,
//   zoom,
//   renderScale
// }) {
//   const [pages, setPages] = useState([]);
  
//   useEffect(() => {
//     if (!pdfDoc || !containerRef.current) return;

//     let cancelled = false;
    
//     const render = async () => {
//       const width = containerRef.current.clientWidth || 800;
//       const result = [];
      
//       for (let i = 1; i <= pdfDoc.numPages; i++) {
//         const page = await pdfDoc.getPage(i);
//         if (cancelled) return;
        
//         const base = page.getViewport({ scale: 1 });
//         const fit = width / base.width;

//         // 🔥 high quality scale only after debounce
//         const viewport = page.getViewport({
//           scale: fit * renderScale
//         });

//         result.push({ page, viewport });
//       }

//       if (!cancelled) setPages(result);
//     };
    
//     render();

//     return () => { cancelled = true; };
//   }, [pdfDoc, renderScale]);

//   return (
//     <div
//       style={{
//         padding: 10,
//         transform: `scale(${zoom / renderScale})`, // 🔥 key trick
//         transformOrigin: '0 0',
//         willChange: 'transform'
//       }}
//     >
//       {imageSrc && (
//         <img src={imageSrc} style={{ maxWidth: '100%' }} />
//       )}

//       {pages.map((p, i) => (
//         <PDFPage key={i} page={p.page} viewport={p.viewport} />
//       ))}
//     </div>
//   );
// }
  

// -------------------------------------------------------------
  // export default function PreviewContent({
  //   containerRef,
  //   imageSrc,
  //   pdfDoc,
  //   scale
  // }) {
  //   const [pages, setPages] = useState([]);
  
  //   useEffect(() => {
  //     if (!pdfDoc || !containerRef.current) return;
  
  //     let cancelled = false;
  
  //     const render = async () => {
  //       const width = containerRef.current.clientWidth || 800;
  //       const result = [];
  
  //       for (let i = 1; i <= pdfDoc.numPages; i++) {
  //         const page = await pdfDoc.getPage(i);
  //         if (cancelled) return;
  
  //         const base = page.getViewport({ scale: 1 });
  //         const fit = width / base.width;
  
  //         const viewport = page.getViewport({ scale: fit });
  
  //         result.push({ page, viewport });
  //       }
  
  //       if (!cancelled) setPages(result);
  //     };
  
  //     render();
  
  //     return () => {
  //       cancelled = true;
  //     };
  //   }, [pdfDoc]);
  
  //   return (
  //     <div
  //       style={{
  //         padding: 10,
  //         transform: `scale(${scale})`,
  //         transformOrigin: '0 0'
  //       }}
  //     >
  //       {imageSrc && (
  //         <img
  //           src={imageSrc}
  //           style={{ maxWidth: '100%' }}
  //         />
  //       )}
  
  //       {pages.map((p, i) => (
  //         <PDFPage key={i} page={p.page} viewport={p.viewport} />
  //       ))}
  //     </div>
  //   );
  // }