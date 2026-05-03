import React from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { theme } from '../styles/theme';

function TopBar({
  newDestName,
  setNewDestName,
  onAdd,
  viewMode,
  setViewMode
}) {

  return (
    <div
      style={{
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',

        background: theme.sidebar,
        borderBottom: `1px solid ${theme.border}`,
        flexShrink: 0
      }}
    >

      {/* ADD BUTTON */}
      <button
        onClick={onAdd}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,

          padding: '6px 10px',
          borderRadius: 6,

          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${theme.border}`,
          color: theme.text,

          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}

        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.hover;
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
        }}
      >
        <Plus size={16} />
        <span style={{ fontSize: 13 }}>Add</span>
      </button>

      {/* INPUT (OPTIONAL NAME) */}
      <input
        placeholder="Optional name..."
        value={newDestName}
        onChange={(e) => setNewDestName(e.target.value)}

        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onAdd();
          }
        }}

        style={{
          flex: 1,
          padding: '6px 10px',
          borderRadius: 6,

          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${theme.border}`,

          color: theme.text,
          outline: 'none',
          fontSize: 13
        }}

        onFocus={(e) => {
          e.target.style.border = `1px solid ${theme.hover}`;
        }}

        onBlur={(e) => {
          e.target.style.border = `1px solid ${theme.border}`;
        }}
      />

      {/* VIEW TOGGLE */}
      <div
        onClick={() =>
          setViewMode(v => (v === 'list' ? 'grid' : 'list'))
        }

        style={{
          width: 34,
          height: 34,

          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          borderRadius: 6,
          cursor: 'pointer',

          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${theme.border}`,

          transition: 'all 0.15s ease'
        }}

        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.hover;
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        }}
      >
        {viewMode === 'list'
          ? <LayoutGrid size={16} />
          : <List size={16} />}
      </div>

    </div>
  );
}

export default TopBar;