import React from 'react';
import { Folder, File } from 'lucide-react';
import { theme } from '../styles/theme'
function DestinationNode({
  item,
  currentPath,
  pathStack,
  setPathStack,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onContextMenu,
  onMove,
  isTemp,
  onCreate,
  cancelCreate,
  loadFolder,
  viewMode
}) {
  const isFolder = item.type === 'folder';
  const isSelected = selectedFile?.path === item.path;

  // ---------------- BASE STYLE ----------------
  const baseStyle = {
    cursor: isTemp ? 'default' : 'pointer',
    background: isSelected ? theme.selected : 'transparent',
    borderRadius: '6px',
    transition: 'all 0.12s ease',
    color: theme.text,
    outline: 'none'
  };

  const listStyle = {
    ...baseStyle,
    padding: '6px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const gridStyle = {
    ...baseStyle,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '80px'
  };

  return (
    <div
      data-node="true"
      draggable={!isTemp}

      // ---------------- DRAG ----------------
      onDragStart={(e) => {
        if (isTemp) return;
        e.dataTransfer.setData('application/json', JSON.stringify(item));
      }}

      onDragOver={(e) => e.preventDefault()}

      onDrop={(e) => {
        e.preventDefault();
        if (isTemp) return;

        const data = JSON.parse(e.dataTransfer.getData('application/json'));
        if (!data?.path) return;

        onMove({
          action: "move",
          sourcePath: data.path,
          targetPath: isFolder ? item.path : currentPath
        });
      }}

      // ---------------- CLICK ----------------
      onClick={() => {
        if (isTemp) return;

        setSelectedFile(item);

        if (!isFolder) {
          onPreview(item);
        }
      }}

      // ---------------- DOUBLE CLICK ----------------
      onDoubleClick={async () => {
        if (isTemp) return;

        if (isFolder) {
          await loadFolder(item.path);
          setPathStack(prev => [...prev, item.path]);
        } else {
          openFile(item);
        }
      }}

      // ---------------- CONTEXT ----------------
      onContextMenu={(e) => {
        if (isTemp) return;
        e.preventDefault();
        onContextMenu(item, e);
      }}

      // ---------------- HOVER EFFECT ----------------
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = theme.hover;
          e.currentTarget.style.outline = `1px solid ${theme.border}`;
        }
      }}

      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.outline = 'none';
        }
      }}

      style={viewMode === 'grid' ? gridStyle : listStyle}
    >
      {isTemp ? (
        <input
          autoFocus
          defaultValue="New Folder"
          onBlur={(e) => onCreate(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onCreate(e.target.value);
            if (e.key === 'Escape') cancelCreate();
          }}
        />
      ) : viewMode === 'grid' ? (
        <>
          {/* ICON */}
          {isFolder ? (
            <Folder size={26} color={theme.muted} />
          ) : (
            <File size={26} color={theme.muted} />
          )}

          {/* NAME */}
          <div
            style={{
              fontSize: '12px',
              color: theme.text,
              opacity: 0.9,
              marginTop: 6,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {item.name}
          </div>
        </>
      ) : (
        <>
          {/* ICON */}
          {isFolder ? (
            <Folder size={18} color={theme.muted} />
          ) : (
            <File size={18} color={theme.muted} />
          )}

          {/* NAME */}
          <span
            style={{
              color: theme.text,
              fontSize: '13px',
              opacity: 0.9
            }}
          >
            {item.name}
          </span>
        </>
      )}
    </div>
  );
}

export default DestinationNode;