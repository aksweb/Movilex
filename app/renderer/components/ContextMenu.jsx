// ContextMenu.jsx (Dont remove this file name)

import React, { useEffect } from 'react';
import { theme } from '../styles/theme';
import MoveDestinationTree from './MoveDestinationTree';

const MENU_WIDTH = 260;
const MENU_HEIGHT = 360;

function ContextMenu({
  menu,
  destinations,
  tree,
  onClose,
  onPreview,
  onMove,            // 🔥 now acts as dispatcher
  loadFolder,
  setCreatingFolder,
  clipboard,
  setClipboard,
  currentPath
}) {
  if (!menu) return null;

  const { x, y, file, origin } = menu;
  const isContainer = file?.isContainer;
  const isFolder = file?.type === 'folder';

  const posX = Math.min(x, window.innerWidth - MENU_WIDTH * 2);
  const posY = Math.min(y, window.innerHeight - MENU_HEIGHT);

  // 🔥 close on outside click
  useEffect(() => {
    const handleClick = () => onClose();
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  //for activating pasting on current directory also
  function getParentPath(p) {
    if (!p) return null;
    const idx = p.lastIndexOf('/');
    return idx === -1 ? p : p.slice(0, idx);
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: posY,
        left: posX,
        width: MENU_WIDTH,
        background: theme.sidebar,
        backdropFilter: 'blur(6px)',

        border: `1px solid ${theme.border}`,
        borderRadius: 10,

        color: theme.text,
        zIndex: 1000,

        boxShadow: '0 10px 30px rgba(0,0,0,0.6)', // 🔥 depth

        padding: 6,
        maxHeight: MENU_HEIGHT,
        overflowY: 'auto'
      }}
    >
      {/* ---------- PREVIEW (file only) ---------- */}
      {!isFolder && (
        <MenuItem
          onClick={() => {
            onPreview(file);
            onClose();
          }}
        >
          Preview
        </MenuItem>
      )}


      {/* COPY AND CUT MENU ITEM */}
      <MenuItem
        onClick={() => {
          setClipboard({
            type: "copy",
            items: [file.path]
          });
          onClose();
        }}
      >
        Copy
      </MenuItem>

      <MenuItem
        onClick={() => {
          setClipboard({
            type: "cut",
            items: [file.path]
          });
          onClose();
        }}
      >
        Cut
      </MenuItem>

      {/* PASTE MENU */}
      {clipboard && (
      <MenuItem
        style={{ color: '#22c55e', fontWeight: 'bold' }}
        onClick={() => {
          onMove({
            action: "paste",
            targetPath: isFolder ? file.path : getParentPath(file.path),
            clipboard
          });
          onClose();
        }}
      >
        Paste
      </MenuItem>
    )}
      {/* ---------- DELETE (file + folder) ---------- */}
      <MenuItem
        style={{ color: '#ef4444' }}
        onClick={() => {
          if (!file?.path) return;

          const ok = window.confirm(`Delete "${file.name}"?`);
          if (!ok) return;

          onMove({
            action: "delete",
            targetPath: file.path
          });

          onClose();
        }}
      >
        Delete
      </MenuItem>

      <Divider />

      {/* ---------- MOVE DESTINATIONS ---------- */}
      <MoveDestinationTree
        destinations={destinations}
        tree={tree}
        file={file}
        onMove={onMove}
        loadFolder={loadFolder}
      />
    </div>
  );
}

export default ContextMenu;

//
// 🔧 UI PRIMITIVES
//
function MenuItem({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '7px 10px',
        cursor: 'pointer',
        userSelect: 'none',

        borderRadius: 6,
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        gap: 8,

        transition: 'background 0.12s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
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
        background: 'rgba(255,255,255,0.08)', // 🔥 fixed
        margin: '6px 4px'
      }}
    />
  );
}