import React from 'react';

function DestinationTree({
  tree,
  destRoot,
  expanded,
  toggleFolder,
  createFolder,
  openFile
}) {

  if (!destRoot) {
    return <div>Select a destination</div>;
  }

  const renderNode = (path, depth = 0) => {
    const items = tree[path] || [];

    return items.map(item => {
      const isFolder = item.type === 'folder';
      const isOpen = expanded.has(item.path);

      return (
        <div key={item.path}>

          {/* ROW */}
          <div
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              }
            }}
            onDoubleClick={() => {
              if (!isFolder) {
                openFile(item);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();

              if (isFolder) {
                createFolder(item.path);
              }
            }}
            style={{
              paddingLeft: depth * 12,
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: isFolder ? 600 : 400,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {/* TOGGLE */}
            {isFolder && (
              <span style={{ marginRight: 6 }}>
                {isOpen ? '▼' : '▶'}
              </span>
            )}

            {/* ICON */}
            <span style={{ marginRight: 6 }}>
              {isFolder ? '📁' : '📄'}
            </span>

            {item.name}
          </div>

          {/* CHILDREN */}
          {isFolder && isOpen && renderNode(item.path, depth + 1)}

        </div>
      );
    });
  };

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      <h4>Destinations</h4>
      {renderNode(destRoot)}
    </div>
  );
}

export default DestinationTree;