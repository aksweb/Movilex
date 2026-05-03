// This file handles Source (SourcePannel) → Selection + Drag origin
import React from 'react';
import SourceRow from './SourceRow';

function SourcePannel({
  files,
  setSelectedFile,
  openFile,
  selectedFile,
  toggleFolder,
  expanded,
  onPreview,
  onMove
}) {
  const isDraggingRef = React.useRef(false);
  const [dragOverPath, setDragOverPath] = React.useState(null);

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid #ccc' }}>
          <th style={{ width: '60%' }}>Name</th>
          <th style={{ width: '20%' }}>Type</th>
          <th style={{ width: '20%' }}>Modified</th>
        </tr>
      </thead>

      <tbody>
        {files.map(item => (
          <SourceRow
            key={item.path}
            item={item}
            isSelected={selectedFile?.path === item.path}
            isOpen={expanded.has(item.path)}
            isDraggingRef={isDraggingRef}
            dragOverPath={dragOverPath}
            setDragOverPath={setDragOverPath}
            setSelectedFile={setSelectedFile}
            toggleFolder={toggleFolder}
            openFile={openFile}
            onPreview={onPreview}
            onMove={onMove}
          />
        ))}
      </tbody>
    </table>
  );
}

export default SourcePannel;