import React, { useState } from 'react';
import {
  createDragPayload,
  parseDragPayload,
  resolveTargetFolder,
  isInvalidMove
} from '../utils/dragDrop';

function DestinationNode({
  item,
  depth,
  tree,
  expanded,
  toggleFolder,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onMove,
  creatingFolder,
  setCreatingFolder
}) {
  const isFolder = item.type === 'folder';
  const isOpen = expanded.has(item.path);
  const isSelected = selectedFile?.path === item.path;

  const [isDragOver, setIsDragOver] = useState(false);

  // ---------------- CHILDREN ----------------
  let children = tree[item.path] || [];

  // 🔥 Inject temp folder (Finder-style)
  if (creatingFolder?.parentPath === item.path) {
    console.log("creatingFolder:", creatingFolder);

    children = [
      {
        path: creatingFolder.tempId,
        name: "",
        type: "folder",
        isTemp: true
      },
      ...children
    ];
  }

  // ---------------- CREATE HANDLER ----------------
  const handleCreate = async (name) => {
    console.log("creatingFolder:", creatingFolder);
    if (!name.trim()) {
      setCreatingFolder(null);
      return;
    }

    if (!creatingFolder?.parentPath) return;

    await onMove({
      action: "create-folder",
      targetPath: creatingFolder.parentPath,
      name
    });
    

    setCreatingFolder(null);
  };

  return (
    <div>
      {/* ---------- NODE ROW ---------- */}
      <div
        draggable={!item.isTemp} // ✅ prevent dragging temp node

        onDragStart={(e) => {
          if (item.isTemp) return;

          e.dataTransfer.setData(
            'application/json',
            createDragPayload(item)
          );
        }}

        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}

        onDragLeave={() => setIsDragOver(false)}

        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);

          if (item.isTemp) return; // ✅ guard

          const data = parseDragPayload(e);
          if (!data) return;

          const target = resolveTargetFolder(item);
          if (!target) return;

          if (isInvalidMove(data.path, target)) return;

          onMove({
            action: "move",
            sourcePath: data.path,
            targetPath: target
          });
        }}

        onClick={() => {
          if (item.isTemp) return; // ✅ prevent temp interaction

          setSelectedFile(item);
          if (isFolder) toggleFolder(item.path);
        }}

        onDoubleClick={() => {
          if (!isFolder || item.isTemp) return;
          openFile(item);
        }}

        onContextMenu={(e) => {
          if (item.isTemp) return; // ✅ no menu on temp
          e.preventDefault();
          if (onPreview) {
            onPreview(item, e, "destination");
          }
        }}

        style={{
          paddingLeft: depth * 14,
          cursor: item.isTemp ? 'default' : 'grab',
          userSelect: 'none',
          fontWeight: isFolder ? 600 : 400,
          backgroundColor: isDragOver
            ? '#bfdbfe'
            : isSelected
            ? '#dbeafe'
            : 'transparent'
        }}
      >
        {/* ---------- EXPAND ICON ---------- */}
        {isFolder && !item.isTemp && (
          <span style={{ marginRight: 6 }}>
            {isOpen ? '▼' : '▶'}
          </span>
        )}

        {/* ---------- ICON ---------- */}
        <span style={{ marginRight: 6 }}>
          {isFolder ? '📁' : '📄'}
        </span>

        {/* ---------- NAME / INPUT ---------- */}
        {item.isTemp ? (
          <input
            autoFocus
            defaultValue="New Folder"

            onBlur={(e) => {
              // ✅ avoid double trigger with Enter
              if (e.relatedTarget === null) return;
              handleCreate(e.target.value);
            }}

            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreate(e.target.value);
              }

              if (e.key === 'Escape') {
                setCreatingFolder(null);
              }
            }}

            style={{
              background: '#1e1e1e',
              color: '#fff',
              border: '1px solid #555',
              outline: 'none',
              fontSize: '13px',
              padding: '2px 4px'
            }}
          />
        ) : (
          item.name
        )}
      </div>

      {/* ---------- CHILDREN ---------- */}
      {isFolder && isOpen &&
        children.map(child => (
          <DestinationNode
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
            creatingFolder={creatingFolder}
            setCreatingFolder={setCreatingFolder}
          />
        ))
      }
    </div>
  );
}

export default DestinationNode;