// ContextMenu.jsx
import React, { useEffect } from 'react';

const MENU_WIDTH = 260;
const MENU_HEIGHT = 360;

const getFilePath = (file) => {
  return (
    file?.path ||
    file?.original_path ||
    file?.sourcePath ||
    null
  );
};

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
  setClipboard
}) {
  if (!menu) return null;

  const { x, y, file, origin } = menu;
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
        background: '#fff',
        border: '1px solid #ccc',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
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

      {/* ---------- CREATE FOLDER (folder only) ---------- */}
      {isFolder && (
        <MenuItem
          onClick={() => {
            console.log("CREATE CLICK FIRED");   // 🔴 DEBUG
            setCreatingFolder({
              parentPath: file.path,
              tempId: "temp-" + Date.now()
            });
            onClose();
          }}
        >
          Create Folder
        </MenuItem>
      )}

      {/* ---------- DELETE (file + folder) ---------- */}
      <MenuItem
        style={{ color: 'red' }}
        onClick={() => {
          onMove({
            action: "delete",
            targetPath: file.path
          });
          onClose();
        }}
      >
        Delete
      </MenuItem>

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

      <Divider />

      {/* ---------- MOVE DESTINATIONS ---------- */}
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
// 🔥 RECURSIVE DESTINATION TREE
//

function HoverFolder({ folder, tree, depth, file, onMove, loadFolder }) {
  const [open, setOpen] = React.useState(false);

  const children = (tree[folder.path] || []).filter(
    item => item.type === 'folder'
  );

  const handleClick = async () => {
    if (!tree[folder.path] && loadFolder) {
      await loadFolder(folder.path);
    }
    setOpen(prev => !prev);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const data = JSON.parse(
      e.dataTransfer.getData('application/json')
    );

    const sourcePath = getFilePath(data);

    if (!sourcePath || !folder.path) return;

    // 🔥 guards
    if (sourcePath === folder.path) return;
    if (sourcePath.startsWith(folder.path + '/')) return;

    onMove({
      action: "move",
      sourcePath,
      targetPath: folder.path
    });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <MenuItem
        onClick={handleClick}
        style={{
          paddingLeft: depth * 14,
          fontWeight: 500
        }}
      >
        {children.length > 0 && (open ? '▼ ' : '▶ ')}
        📁 {folder.name}
      </MenuItem>

      {open && (
        <div>
          {/* MOVE HERE */}
          <MenuItem
            style={{
              paddingLeft: (depth + 1) * 14,
              color: '#2563eb',
              fontWeight: 'bold'
            }}
            onClick={() => {
              const sourcePath = getFilePath(file);
              if (!sourcePath || !folder.path) return;

              onMove({
                action: "move",
                sourcePath,
                targetPath: folder.path
              });
            }}
          >
            → Move here
          </MenuItem>

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