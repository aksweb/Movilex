// this file handles DestinationPanel     →  Structure + Navigation + Drop target
import React, { useState } from 'react';

import {
  createDragPayload,
  parseDragPayload,
  resolveTargetFolder,
  isInvalidMove
} from '../utils/dragDrop';

function DestinationPanel({
  tree,
  destRoot,
  expanded,
  toggleFolder,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onMove
}) {
  if (!destRoot) {
    return <div>No destination selected</div>;
  }

  return (
    <div>
      {(tree[destRoot] || []).map(item => (
        <TreeNode
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
        />
      ))}
    </div>
  );
}

export default DestinationPanel;

//
// 🔥 NODE COMPONENT
//

function TreeNode({
  item,
  depth,
  tree,
  expanded,
  toggleFolder,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onMove
}) {
  const isFolder = item.type === 'folder';
  const isOpen = expanded.has(item.path);
  const isSelected = selectedFile?.path === item.path;

  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div>
      <div
        // ---------- DRAG ----------
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(
            'application/json',
            createDragPayload(item)
          );
        }}

        // ---------- DRAG OVER ----------
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);

        }}

        onDragLeave={() => setIsDragOver(false)}

        // ---------- DROP ----------
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);

          const data = parseDragPayload(e);
          if (!data) return;

          const target = resolveTargetFolder(item);

          if (isInvalidMove(data.path, target)) return;

          onMove({
            action: "move",   // 🔥 REQUIRED
            sourcePath: data.path,
            targetPath: target
          });
        }}

        // ---------- CLICK ----------
        onClick={() => {
          setSelectedFile(item);
          if (isFolder) toggleFolder(item.path);
        }}

        // ---------- DOUBLE CLICK ----------
        onDoubleClick={() => {
          if (!isFolder) openFile(item);
        }}

        // ---------- RIGHT CLICK ----------
        onContextMenu={(e) => {
          e.preventDefault();

          if (onPreview) {
            onPreview(item, e, "destination"); // 🔥 critical
          }
        }}

        style={{
          paddingLeft: depth * 14,
          cursor: 'grab',
          userSelect: 'none',
          fontWeight: isFolder ? 600 : 400,
          backgroundColor: isDragOver
            ? '#bfdbfe'
            : isSelected
            ? '#dbeafe'
            : 'transparent'
        }}
      >
        {isFolder && (
          <span style={{ marginRight: 6 }}>
            {isOpen ? '▼' : '▶'}
          </span>
        )}

        <span style={{ marginRight: 6 }}>
          {isFolder ? '📁' : '📄'}
        </span>

        {item.name}
      </div>

      {/* children */}
      {isFolder &&
        isOpen &&
        (tree[item.path] || []).map(child => (
          <TreeNode
            key={child.path}
            item={child}
            depth={depth + 1}
            tree={tree}
            expanded={expanded}
            toggleFolder={toggleFolder}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            openFile={openFile}
            onPreview={onPreview}
            onMove={onMove}
          />
        ))}
    </div>
  );
}