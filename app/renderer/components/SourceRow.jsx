import React from 'react';
import {
  createDragPayload,
  parseDragPayload,
  resolveTargetFolder,
  isInvalidMove
} from '../utils/dragDrop';

function SourceRow({
  item,
  isSelected,
  isOpen,
  isDraggingRef,
  dragOverPath,
  setDragOverPath,
  setSelectedFile,
  toggleFolder,
  openFile,
  onPreview,
  onMove
}) {
  const isFolder = item.type === 'folder';

  return (
    <tr
      draggable
      key={item.path}

      onDragStart={(e) => {
        isDraggingRef.current = true;

        e.currentTarget.style.opacity = "0.5";

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

      onDragEnd={(e) => {
        e.currentTarget.style.opacity = "1";

        setTimeout(() => {
          isDraggingRef.current = false;
        }, 50);
      }}

      onDragOver={(e) => {
        e.preventDefault();
        setDragOverPath(item.path);
      }}

      onDragLeave={() => {
        setDragOverPath(null);
      }}

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

      onClick={() => {
        if (isDraggingRef.current) return;

        setSelectedFile(item);

        if (isFolder) {
          toggleFolder(item.path);
        }
      }}

      onDoubleClick={() => {
        if (!isFolder) openFile(item);
      }}

      onContextMenu={(e) => {
        e.preventDefault();
        if (onPreview) {
          onPreview(item, e, "source");
        }
      }}

      style={{
        cursor: isFolder ? 'pointer' : 'grab',
        borderBottom: '1px solid #eee',
        userSelect: 'none',
        backgroundColor:
          dragOverPath === item.path
            ? '#bfdbfe'
            : isSelected
            ? '#dbeafe'
            : 'transparent'
      }}
    >
      <td
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
          paddingLeft: `${item.depth * 14}px`,
          fontWeight: isFolder ? 600 : 400,
          userSelect: 'none'
        }}
      >
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
}

export default SourceRow;