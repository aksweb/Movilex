import React from 'react';

function DestinationTree({
  tree,
  destRoot,
  expanded,
  toggleFolder,
  createFolder,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview
}) {

  if (!destRoot) {
    return <div>No destination selected</div>;
  }

  const renderNode = (path, depth = 0) => {
    const items = tree[path] || [];

    return items.map(item => {
      const isFolder = item.type === 'folder';
      const isOpen = expanded.has(item.path);
      const isSelected = selectedFile?.path === item.path;

      return (
        <div key={item.path}>

          <div
            onClick={() => {
              setSelectedFile(item);              // ✅ highlight works
              if (isFolder) toggleFolder(item.path);
            }}

            onDoubleClick={() => {
              if (!isFolder) openFile(item);      // ✅ open system app
            }}

            onContextMenu={(e) => {
                e.preventDefault();
                if (!isFolder && onPreview) {
                    onPreview(item, e);
                }
                }}

            style={{
              paddingLeft: depth * 14,
              cursor: 'pointer',
              userSelect: 'none',
              fontWeight: isFolder ? 600 : 400,
              backgroundColor: isSelected ? '#dbeafe' : 'transparent' // 🔥 highlight
            }}
          >
            {/* toggle */}
            {isFolder && (
              <span style={{ marginRight: 6 }}>
                {isOpen ? '▼' : '▶'}
              </span>
            )}

            {/* icon */}
            <span style={{ marginRight: 6 }}>
              {isFolder ? '📁' : '📄'}
            </span>

            {item.name}
          </div>

          {/* children */}
          {isFolder && isOpen && renderNode(item.path, depth + 1)}

        </div>
      );
    });
  };

  return (
    <div>
      {renderNode(destRoot)}
    </div>
  );
}

export default DestinationTree;