// This file handles Source (SourcePannel) → Selection + Drag origin

import React from 'react';

import {
  createDragPayload,
  parseDragPayload,
  resolveTargetFolder,
  isInvalidMove
} from '../utils/dragDrop';

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
          <th style={{ width: '60%', textAlign: 'left' }}>Name</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Type</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Modified</th>
        </tr>
      </thead>

      <tbody>
        {files.map(item => {
          const isSelected = selectedFile?.path === item.path;
          const isFolder = item.type === 'folder';
          const isOpen = expanded.has(item.path);

          return (
            <tr
              key={item.path}
              draggable

              // ---------- DRAG START ----------
              onDragStart={(e) => {
                isDraggingRef.current = true;

                e.currentTarget.style.opacity = "0.5";

                // ghost preview
                const ghost = document.createElement("div");
                ghost.innerText = item.name;
                ghost.style.position = "absolute";
                ghost.style.top = "-1000px";
                ghost.style.padding = "4px 8px";
                ghost.style.background = "#333";
                ghost.style.color = "#fff";
                ghost.style.fontSize = "12px";
                ghost.style.borderRadius = "4px";

                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 0, 0);

                setTimeout(() => document.body.removeChild(ghost), 0);

                e.dataTransfer.setData(
                  'application/json',
                  createDragPayload(item)
                );
              }}

              // ---------- DRAG END ----------
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = "1";

                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 50);
              }}

              // ---------- DRAG OVER ----------
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverPath(item.path);
              }}

              onDragLeave={() => {
                setDragOverPath(null);
              }}

              // ---------- DROP ----------
              onDrop={(e) => {
                e.preventDefault();

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

              // ---------- CLICK ----------
              onClick={() => {
                if (isDraggingRef.current) return;

                setSelectedFile(item);

                if (isFolder) {
                  toggleFolder(item.path);
                }
              }}

              // ---------- DOUBLE CLICK ----------
              onDoubleClick={() => {
                if (!isFolder) openFile(item);
              }}

              // ---------- RIGHT CLICK ----------
              onContextMenu={(e) => {
                e.preventDefault();
                if (onPreview) {
                  onPreview(item, e, "source");
                }
              }}

              style={{
                cursor: isFolder ? 'pointer' : 'grab',
                borderBottom: '1px solid #eee',
                userSelect: 'none', // 🔥 key fix
                backgroundColor:
                  dragOverPath === item.path
                    ? '#bfdbfe'
                    : isSelected
                    ? '#dbeafe'
                    : 'transparent'
              }}
            >
              {/* NAME */}
              <td
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  paddingLeft: `${item.depth * 14}px`,
                  fontWeight: isFolder ? 600 : 400,
                  userSelect: 'none' // 🔥 key fix
                }}
              >
                {/* TOGGLE */}
                {isFolder && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDraggingRef.current) return;
                      toggleFolder(item.path);
                    }}
                    style={{ marginRight: 6, cursor: 'pointer' }}
                  >
                    {isOpen ? '▼' : '▶'}
                  </span>
                )}

                {/* ICON */}
                <span style={{ marginRight: 6 }}>
                  {isFolder ? '📁' : '📄'}
                </span>

                {item.name}
              </td>

              <td>{item.type}</td>

              <td>
                {item.modified
                  ? new Date(item.modified).toLocaleString()
                  : '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default SourcePannel;