import React, { useEffect, useRef } from 'react';

function PDFPage({ page, viewport }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');

      // 🔥 cancel previous render (prevents crash)
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }

      // 🔥 HIGH DPI FIX
      const dpr = window.devicePixelRatio || 1;

      // clamp DPR for performance (important)
      const effectiveDpr = Math.min(dpr, 2);

      const width = viewport.width;
      const height = viewport.height;

      // actual pixel buffer (high-res)
      canvas.width = Math.floor(width * effectiveDpr);
      canvas.height = Math.floor(height * effectiveDpr);

      // visual size (CSS)
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // reset + apply scale
      ctx.setTransform(effectiveDpr, 0, 0, effectiveDpr, 0, 0);

      // 🔥 render
      const task = page.render({
        canvasContext: ctx,
        viewport
      });

      renderTaskRef.current = task;

      try {
        await task.promise;
      } catch (err) {
        // ignore expected cancellation
        if (err?.name !== 'RenderingCancelledException') {
          console.error(err);
        }
      }

      if (cancelled) return;
    };

    render();

    return () => {
      cancelled = true;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [page, viewport]);

  return (
    <div style={{ marginBottom: 12 }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          imageRendering: 'auto' // 🔥 ensure smooth scaling
        }}
      />
    </div>
  );
}

export default PDFPage;

// import React, { useEffect, useRef } from 'react';

// function PDFPage({ page, viewport }) {
//   const canvasRef = useRef();
//   const renderTaskRef = useRef(null);

//   useEffect(() => {
//     let cancelled = false;

//     const render = async () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;

//       const ctx = canvas.getContext('2d');

//       // 🔥 cancel previous render if exists
//       if (renderTaskRef.current) {
//         try {
//           renderTaskRef.current.cancel();
//         } catch {}
//       }

//       canvas.width = viewport.width;
//       canvas.height = viewport.height;

//       const task = page.render({
//         canvasContext: ctx,
//         viewport
//       });

//       renderTaskRef.current = task;

//       try {
//         await task.promise;
//       } catch (err) {
//         // 🔥 ignore cancel errors (expected)
//         if (err?.name !== 'RenderingCancelledException') {
//           console.error(err);
//         }
//       }

//       if (cancelled) return;
//     };

//     render();

//     return () => {
//       cancelled = true;

//       // 🔥 cancel on unmount / re-render
//       if (renderTaskRef.current) {
//         try {
//           renderTaskRef.current.cancel();
//         } catch {}
//       }
//     };
//   }, [page, viewport]);

//   return (
//     <div style={{ marginBottom: 12 }}>
//       <canvas ref={canvasRef} style={{ display: 'block' }} />
//     </div>
//   );
// }

// export default PDFPage;