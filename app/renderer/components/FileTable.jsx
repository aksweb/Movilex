import React from 'react';

function FileTable({
  files,
  setSelectedFile,
  openFile,
  selectedFile,
  toggleFolder,
  expanded,
  onPreview
}) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      
      <thead>
        <tr style={{ borderBottom: '1px solid #ccc' }}>
          <th style={{ width: '60%', textAlign: 'left' }}>Name</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Type</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Modified</th>
        </tr>
      </thead>

      <tbody>
        {files.map(item => {
          const isSelected = selectedFile?.path === item.path;
          const isFolder = item.type === 'folder';
          const isOpen = expanded.has(item.path);

          return (
            <tr
              key={item.path}
              onClick={() => {
                setSelectedFile(item); // ✅ select
                if (isFolder) toggleFolder(item.path); // optional expand
              }}
              onDoubleClick={() => {
                if (!isFolder) openFile(item); // ✅ open system app
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                if (!isFolder && onPreview) {
                  onPreview(item); // ✅ preview
                }
              }}
              style={{
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: isSelected ? '#dbeafe' : 'transparent'
              }}
            >
              {/* NAME */}
              <td
                style={{
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  paddingLeft: `${item.depth * 14}px`,
                  fontWeight: isFolder ? 600 : 400
                }}
              >
                {isFolder && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFolder(item.path);
                    }}
                    style={{ marginRight: 6, cursor: 'pointer' }}
                  >
                    {isOpen ? '▼' : '▶'}
                  </span>
                )}

                <span style={{ marginRight: 6 }}>
                  {isFolder ? '📁' : '📄'}
                </span>

                {item.name}
              </td>

              {/* TYPE */}
              <td>{item.type}</td>

              {/* MODIFIED */}
              <td>
                {item.modified
                  ? new Date(item.modified).toLocaleString()
                  : '-'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default FileTable;