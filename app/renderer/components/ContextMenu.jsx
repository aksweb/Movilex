import React, { useState } from 'react';

function ContextMenu({ menu, destinations, tree, onClose, onPreview, onMove }) {
  if (!menu) return null;

  const { x, y, file } = menu;
  const MENU_WIDTH = 300;
const MENU_MAX_HEIGHT = 400;

// clamp inside viewport
const posX = Math.min(x, window.innerWidth - MENU_WIDTH - 10);
const posY = Math.min(y, window.innerHeight - MENU_MAX_HEIGHT - 10);


  return (
    <div
      style={{
        position: 'fixed',
        top: posY,
        left: posX,
        width: MENU_WIDTH,

        background: '#fff',
        border: '1px solid #ccc',
        zIndex: 1000,
        padding: 6,

        maxHeight: MENU_MAX_HEIGHT,
        overflowY: 'auto',   // 🔥 vertical scroll
        overflowX: 'hidden',

        boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={onClose}
    >
      {/* -------- PREVIEW -------- */}
      <div
        style={{ padding: 6, cursor: 'pointer' }}
        onClick={() => {
          onPreview(file);
          onClose();
        }}
      >
        Preview
      </div>

      <hr />
        <p>Move To</p>
      {/* -------- SEND TO -------- */}
      {destinations.map(dest => (
        <FolderNode
          key={dest.path}
          folder={{ name: dest.name, path: dest.path }}
          tree={tree}
          depth={0}
          file={file}
          onMove={onMove}
        />
      ))}
    </div>
  );
}

function FolderNode({ folder, tree, depth, file, onMove }) {
  const [open, setOpen] = useState(false);

  const children = (tree[folder.path] || []).filter(
    item => item.type === 'folder'
  );

  return (
    <div>
      {/* Folder row */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen(prev => !prev);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onMove(file, folder.path); // ✅ move here
        }}
        style={{
          paddingLeft: depth * 12,
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        {children.length > 0 && (
          <span style={{ marginRight: 6 }}>
            {open ? '▼' : '▶'}
          </span>
        )}
        📁 {folder.name}
      </div>

      {/* Children */}
      {open && children.map(child => (
        <FolderNode
          key={child.path}
          folder={child}
          tree={tree}
          depth={depth + 1}
          file={file}
          onMove={onMove}
        />
      ))}
    </div>
  );
}

export default ContextMenu;