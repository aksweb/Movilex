import React from 'react';
import { theme } from '../styles/theme';
import { ChevronRight, ChevronDown, Folder, CornerDownRight } from 'lucide-react';

export const getFilePath = (file) =>
  file?.path || file?.original_path || file?.sourcePath || null;

function TreeMenuItem({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '6px 10px',
        cursor: 'pointer',
        userSelect: 'none',

        borderRadius: 6,
        fontSize: 13,

        display: 'flex',
        alignItems: 'center',
        gap: 6,

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

export function HoverFolder({ folder, tree, depth, file, onMove, loadFolder }) {
  const [open, setOpen] = React.useState(false);

  const children = (tree[folder.path] || []).filter(
    (item) => item.type === 'folder'
  );

  const handleClick = async () => {
    if (!tree[folder.path] && loadFolder) {
      await loadFolder(folder.path);
    }
    setOpen((prev) => !prev);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    const data = JSON.parse(e.dataTransfer.getData('application/json'));

    const sourcePath = getFilePath(data);

    if (!sourcePath || !folder.path) return;

    if (sourcePath === folder.path) return;
    if (sourcePath.startsWith(folder.path + '/')) return;

    onMove({
      action: 'move',
      sourcePath,
      targetPath: folder.path
    });
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <TreeMenuItem
        onClick={handleClick}
        style={{
          paddingLeft: depth * 12 + 8,
          fontWeight: 500
        }}
      >
        {/* Chevron */}
        {children.length > 0 ? (
          open
            ? <ChevronDown size={14} style={{ opacity: 0.6 }} />
            : <ChevronRight size={14} style={{ opacity: 0.6 }} />
        ) : (
          <span style={{ width: 14 }} /> // alignment spacer
        )}
  
        {/* Folder icon */}
        <Folder size={14} style={{ opacity: 0.85 }} />
  
        {/* Name */}
        <span style={{ flex: 1 }}>{folder.name}</span>
      </TreeMenuItem>
  
      {open && (
        <div>
          {/* MOVE HERE */}
          <TreeMenuItem
            style={{
              paddingLeft: (depth + 1) * 12 + 8,
              color: '#22c55e',
              fontWeight: 500
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
            <span style={{ width: 14 }} /> {/* align with chevron */}
  
            <CornerDownRight size={14} style={{ opacity: 0.8 }} />
  
            Move here
          </TreeMenuItem>
  
          {children.map((child) => (
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

export default function MoveDestinationTree({
  destinations,
  tree,
  file,
  onMove,
  loadFolder
}) {
  return (
    <>
      {(destinations || []).map((dest) => (
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
    </>
  );
}
