import React, { useEffect } from 'react';
import { theme } from '../styles/theme';

function MoveToast({ toast, onClose, onNavigate }) {
  useEffect(() => {
    if (!toast) return;

    const t = setTimeout(onClose, 4000); // auto hide
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',

        background: 'rgba(22,24,29,0.95)',
        backdropFilter: 'blur(6px)',

        border: `1px solid ${theme.border}`,
        borderRadius: 10,

        padding: '10px 14px',
        minWidth: 280,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,

        color: theme.text,
        fontSize: 13,

        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
        zIndex: 2000
      }}
    >
      <span>
        Moved to <b>{toast.name}</b>
      </span>

      <span
        onClick={() => {
          onNavigate(toast.path);
          onClose();
        }}
        style={{
          color: '#22c55e',
          cursor: 'pointer',
          fontWeight: 500
        }}
      >
        Open Folder
      </span>
    </div>
  );
}

export default MoveToast;