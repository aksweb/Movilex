import React, { useState } from 'react';

const MENU_WIDTH = 260;
const MENU_HEIGHT = 360;

function ContextMenu({
  menu,
  destinations,
  tree,
  onClose,
  onPreview,
  onMove,
  loadFolder
}) {
  if (!menu) return null;

  const { x, y, file } = menu;

  // clamp root menu inside viewport
  const posX = Math.min(x, window.innerWidth - MENU_WIDTH * 2);
  const posY = Math.min(y, window.innerHeight - MENU_HEIGHT);

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
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        padding: 6,
        maxHeight: MENU_HEIGHT,
        overflowY: 'auto'
      }}
      onMouseLeave={onClose}

    >
      {/* PREVIEW */}
      <MenuItem
        onClick={() => {
          onPreview(file);
          onClose();
        }}
      >
        Preview
      </MenuItem>

      <Divider />

      {/* DESTINATIONS */}
      {destinations.map(dest => (
        <HoverFolder
          key={dest.path}
          folder={dest}
          tree={tree}
          depth={0}
          file={file}
          onMove={onMove}
          loadFolder={loadFolder}
        />
      ))}
    </div>
  );
}

export default ContextMenu;

//
// 🔥 RECURSIVE HOVER MENU
//

function HoverFolder({ folder, tree, depth, file, onMove, loadFolder }) {
  const [open, setOpen] = useState(false);

  const children = (tree[folder.path] || []).filter(
    item => item.type === 'folder'
  );

  const handleToggle = async () => {
    if (!tree[folder.path] && loadFolder) {
      await loadFolder(folder.path);
    }
    setOpen(prev => !prev);
  };

  return (
    <div>
      {/* Folder row */}
      <MenuItem
        onClick={handleToggle}
        style={{
          paddingLeft: depth * 14,
          fontWeight: 500
        }}
      >
        {children.length > 0 && (open ? '▼ ' : '▶ ')}
        📁 {folder.name}
      </MenuItem>

      {/* Expanded content */}
      {open && (
        <div>
          {/* Move option */}
          <MenuItem
            style={{
              paddingLeft: (depth + 1) * 14,
              color: '#2563eb',
              fontWeight: 'bold'
            }}
            onClick={() => onMove(file, folder.path)}
          >
            → Move here
          </MenuItem>

          {/* Children */}
          {children.map(child => (
            <HoverFolder
              key={child.path}
              folder={child}
              tree={tree}
              depth={depth + 1}
              file={file}
              onMove={onMove}
              loadFolder={loadFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

//
// 🔧 UI PRIMITIVES
//

function MenuItem({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '6px 8px',
        cursor: 'pointer',
        userSelect: 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#eee';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: 1,
        background: '#ddd',
        margin: '4px 0'
      }}
    />
  );
}