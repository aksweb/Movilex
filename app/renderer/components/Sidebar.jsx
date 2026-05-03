import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Folder } from 'lucide-react';
import { theme } from '../styles/theme'; // adjust if needed

function Sidebar({
  destinations,
  destRoot,
  setDestRoot,
  isSidebarOpen,
  setIsSidebarOpen
}) {

  return (
    <div
      style={{
        width: isSidebarOpen ? '220px' : '48px',
        transition: 'width 0.2s ease',
        background: theme.sidebar,
        borderRight: `1px solid ${theme.border}`,

        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%'
      }}
    >

      {/* ===== TOGGLE ===== */}
      <div
        onClick={() => setIsSidebarOpen(prev => !prev)}
        style={{
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          cursor: 'pointer',
          borderBottom: `1px solid ${theme.border}`,

          transition: 'all 0.15s ease'
        }}

        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.hover;
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {isSidebarOpen
          ? <PanelLeftClose size={18} color={theme.text} />
          : <PanelLeftOpen size={18} color={theme.text} />}
      </div>

      {/* ===== LIST ===== */}
      {isSidebarOpen && (
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            padding: '6px'
          }}
        >
          {destinations.map(dest => {
            const isActive = dest.path === destRoot;

            return (
              <div
                key={dest.path}
                onClick={() => setDestRoot(dest.path)}

                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',

                  padding: '8px 10px',
                  marginBottom: 4,

                  borderRadius: 6,

                  cursor: 'pointer',

                  background: isActive
                    ? theme.selected
                    : 'transparent',

                  color: theme.text,

                  transition: 'all 0.15s ease'
                }}

                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.hover;
                  }
                }}

                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* ICON */}
                <Folder size={16} color={theme.muted} />

                {/* NAME */}
                <span
                  style={{
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {dest.name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;