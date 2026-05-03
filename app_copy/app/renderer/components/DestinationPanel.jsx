import React from 'react';
import DestinationNode from './DestinationNode';

function DestinationPanel({
  tree,
  destRoot,
  expanded,
  toggleFolder,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onMove,
  creatingFolder,    // 🔥 ADD
  setCreatingFolder,  // 🔥 ADD
}) {
  if (!destRoot) {
    return <div>No destination selected</div>;
  }

  return (
    <div>
      {(tree[destRoot] || []).map(item => (
        <DestinationNode
          key={item.path}
          item={item}
          depth={0}
          tree={tree}
          expanded={expanded}
          toggleFolder={toggleFolder}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          openFile={openFile}
          onPreview={onPreview}
          onMove={onMove}
          creatingFolder={creatingFolder}        // 🔥 ADD
          setCreatingFolder={setCreatingFolder}  // 🔥 ADD
        />
      ))}
    </div>
  );
}

export default DestinationPanel;