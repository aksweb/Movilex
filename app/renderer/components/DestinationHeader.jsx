import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { theme } from '../styles/theme'

function DestinationHeader({
  normalizedPath,
  pathStack,
  onBack
}) {

  const canGoBack = pathStack.length > 1;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: 10
      }}
    >

      {/* BACK BUTTON */}
      <div
        onClick={canGoBack ? onBack : undefined}
        style={{
          width: 28,
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,

          cursor: canGoBack ? 'pointer' : 'not-allowed',
          opacity: canGoBack ? 1 : 0.4,

          transition: 'all 0.15s ease'
        }}

        onMouseEnter={(e) => {
          if (canGoBack) {
            e.currentTarget.style.background = theme.hover;
            e.currentTarget.style.outline = `1px solid ${theme.border}`;
          }
        }}

        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.outline = 'none';
        }}
      >
        <ArrowLeft size={16} color={theme.text} />
      </div>

      {/* PATH BOX */}
      <div
        style={{
          flex: 1,
          padding: '6px 10px',
          borderRadius: 6,

          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${theme.border}`,

          color: theme.muted,
          fontSize: '12px',

          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {normalizedPath}
      </div>

    </div>
  );
}

export default DestinationHeader;