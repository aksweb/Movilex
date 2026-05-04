import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize, FolderInput } from 'lucide-react';
import { theme } from '../styles/theme';
import MoveDestinationTree from './MoveDestinationTree';

function IconBtn({ children, onClick, title, style }) {
  return (
    <div
      role="button"
      title={title}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default function PreviewToolbar({
  setZoom,
  file,
  destinations,
  tree,
  loadFolder,
  onMove
}) {
  const [moveOpen, setMoveOpen] = useState(false);
  const moveWrapRef = useRef(null);

  useEffect(() => {
    if (!moveOpen) return;
    const onDocMouseDown = (e) => {
      if (moveWrapRef.current && !moveWrapRef.current.contains(e.target)) {
        setMoveOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [moveOpen]);

  const dispatchMove = (payload) => {
    onMove?.(payload);
    setMoveOpen(false);
  };

  const hasDestinations = (destinations || []).length > 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6,
        padding: '6px',
        background: theme.sidebar,
        borderBottom: `1px solid ${theme.border}`
      }}
    >
      <IconBtn
        title="Zoom in"
        onClick={() => setZoom((z) => Math.min(5, z * 1.2))}
      >
        <ZoomIn size={16} />
      </IconBtn>

      <IconBtn
        title="Zoom out"
        onClick={() => setZoom((z) => Math.max(0.2, z * 0.8))}
      >
        <ZoomOut size={16} />
      </IconBtn>

      <IconBtn title="Reset zoom" onClick={() => setZoom(1)}>
        <Maximize size={16} />
      </IconBtn>

      <div ref={moveWrapRef} style={{ marginLeft: 'auto', position: 'relative' }}>
        <button
          type="button"
          title={
            hasDestinations
              ? 'Pick a destination folder to move this file'
              : 'Add a destination from the top bar first'
          }
          onClick={() => hasDestinations && setMoveOpen((o) => !o)}
          disabled={!hasDestinations}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 30,
            padding: '0 10px',
            borderRadius: 6,
            cursor: hasDestinations ? 'pointer' : 'not-allowed',
            opacity: hasDestinations ? 1 : 0.45,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${theme.border}`,
            color: theme.text,
            fontSize: 12,
            fontWeight: 500
          }}
        >
          <FolderInput size={14} />
          Move to…
        </button>

        {moveOpen && (
          <div
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: 4,
              width: 260,
              maxHeight: 320,
              overflowY: 'auto',
              background: theme.sidebar,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              padding: 6,
              color: theme.text
            }}
          >
            <MoveDestinationTree
              destinations={destinations}
              tree={tree}
              file={file}
              onMove={dispatchMove}
              loadFolder={loadFolder}
            />
          </div>
        )}
      </div>
    </div>
  );
}
