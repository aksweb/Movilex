import React, { useRef } from 'react';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
import * as pdfjsLib from 'pdfjs-dist';

import { usePreviewLoader } from './hooks/usePreviewLoader';
import { usePanZoom } from './hooks/usePanZoom';

import PreviewToolbar from './PreviewToolbar';
import PreviewContent from './PreviewContent';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function PreviewPane({
  file,
  destinations,
  tree,
  loadFolder,
  onMove
}) {
  const containerRef = useRef();

  const { imageSrc, pdfDoc } = usePreviewLoader(file);

  const {
    zoom,
    renderScale,
    setZoom,
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUp
  } = usePanZoom(containerRef);

  if (!file) return <div style={{ padding: 20 }}>No file selected</div>;

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 🔥 Toolbar uses zoom */}
      <PreviewToolbar
        setZoom={setZoom}
        file={file}
        destinations={destinations}
        tree={tree}
        loadFolder={loadFolder}
        onMove={onMove}
      />

      {/* 🔥 Scroll + interaction layer */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <PreviewContent
          containerRef={containerRef}
          imageSrc={imageSrc}
          pdfDoc={pdfDoc}
          zoom={zoom}                 // ✔ correct
          renderScale={renderScale}   // ✔ correct
          file={file}
        />
      </div>
    </div>
  );
}

export default PreviewPane;


// import React, { useRef } from 'react';
// import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url';
// import * as pdfjsLib from 'pdfjs-dist';

// import { usePreviewLoader } from './hooks/usePreviewLoader';
// import { usePanZoom } from './hooks/usePanZoom'

// import PreviewToolbar from './PreviewToolbar';
// import PreviewContent from './PreviewContent';

// pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// function PreviewPane({ file }) {
//   const containerRef = useRef();

//   const { imageSrc, pdfDoc } = usePreviewLoader(file);

//   const {
//     scale,
//     setScale,
//     isDragging,
//     onMouseDown,
//     onMouseMove,
//     onMouseUp,
//     zoom,
//   renderScale,
//   setZoom,

//   } = usePanZoom(containerRef);

//   if (!file) return <div style={{ padding: 20 }}>No file selected</div>;

//     return (
//       <div
//         style={{
//           height: '100%',
//           display: 'flex',
//           flexDirection: 'column'
//         }}
//       >
//         <PreviewToolbar setZoom={setZoom} />
    
//         <div
//           ref={containerRef}
//           style={{
//             flex: 1,
//             minHeight: 0,
//             overflow: 'auto',
//             cursor: isDragging ? 'grabbing' : 'default'
//           }}
//           onMouseDown={onMouseDown}
//           onMouseMove={onMouseMove}
//           onMouseUp={onMouseUp}
//           onMouseLeave={onMouseUp}
//         >
//           <PreviewContent
//             containerRef={containerRef}
//             imageSrc={imageSrc}
//             pdfDoc={pdfDoc}
//             scale={scale}
//             renderScale={renderScale}
//           />
//         </div>
//       </div>
//     );

// }

// export default PreviewPane;


// ------------------------------------
    // <div>
    //     <PreviewToolbar setZoom={setZoom}/>
    //   <div
    //     ref={containerRef}
    //     style={{
    //       height: '100%',
    //       overflow: 'auto',
    //       cursor: isDragging ? 'grabbing' : 'default'
    //     }}
    //     onMouseDown={onMouseDown}
    //     onMouseMove={onMouseMove}
    //     onMouseUp={onMouseUp}
    //     onMouseLeave={onMouseUp}
    //   >

    //     <PreviewContent
    //       containerRef={containerRef}
    //       imageSrc={imageSrc}
    //       pdfDoc={pdfDoc}
    //       scale={scale}
    //       renderScale={renderScale}

    //     />
    //   </div>
    // </div>