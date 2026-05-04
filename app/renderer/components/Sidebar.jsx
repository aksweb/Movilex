import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Folder, X } from 'lucide-react';
import { theme } from '../styles/theme';

function Sidebar({
  destinations,
  destRoot,
  setDestRoot,
  isSidebarOpen,
  setIsSidebarOpen,
  onRemoveDestination   // 🔥 NEW
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
          borderBottom: `1px solid ${theme.border}`
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
            padding: 6
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
                  gap: 8,

                  padding: '8px 10px',
                  marginBottom: 4,
                  borderRadius: 6,

                  cursor: 'pointer',

                  background: isActive
                    ? theme.selected
                    : 'transparent',

                  color: theme.text,

                  transition: 'all 0.15s ease',

                  position: 'relative'
                }}

                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = theme.hover;
                  }

                  // 🔥 show close button
                  const closeBtn = e.currentTarget.querySelector('.close-btn');
                  if (closeBtn) closeBtn.style.opacity = 1;
                }}

                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }

                  const closeBtn = e.currentTarget.querySelector('.close-btn');
                  if (closeBtn) closeBtn.style.opacity = 0;
                }}
              >
                {/* ICON */}
                <Folder size={16} color={theme.muted} />

                {/* NAME */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {dest.name}
                </span>

                {/* 🔥 REMOVE BUTTON */}
                <div
                  className="close-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevent navigation

                    onRemoveDestination(dest.path);
                  }}
                  style={{
                    width: 20,
                    height: 20,

                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',

                    borderRadius: 4,

                    opacity: 0,
                    transition: 'opacity 0.15s ease',

                    cursor: 'pointer'
                  }}

                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.hover;
                  }}

                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <X size={12} color={theme.muted} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Sidebar;