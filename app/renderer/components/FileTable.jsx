import React from 'react';

function FileTable({
  files,
  setSelectedFile,
  openFile,
  selectedFile,
  toggleFolder,
  expanded
}) {

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      
      {/* HEADER */}
      <thead>
        <tr style={{ borderBottom: '1px solid #ccc' }}>
          <th style={{ width: '60%', textAlign: 'left' }}>Name</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Type</th>
          <th style={{ width: '20%', textAlign: 'left' }}>Modified</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody>
        {files.map(file => {
          const isSelected = selectedFile?.path === file.path;
          const isFolder = file.type === 'folder';

          return (
            <tr
              key={file.path}
              onClick={() => {
                if (!isFolder) {
                  setSelectedFile(file);
                }
              }}
              onDoubleClick={() => {
                if (!isFolder) {
                  openFile(file);
                }
              }}
              style={{
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: isSelected ? '#dbeafe' : 'transparent'
              }}
            >
              {/* NAME COLUMN */}
              <td
                style={{
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  paddingLeft: `${file.depth * 14}px`,
                  fontWeight: isFolder ? '600' : 'normal'
                }}
              >
                {/* TOGGLE ICON */}
                {isFolder && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 prevent row click
                      toggleFolder(file.path);
                    }}
                    style={{
                      marginRight: 6,
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {expanded.has(file.path) ? '▼' : '▶'}
                  </span>
                )}

                {/* FILE/FOLDER ICON */}
                <span style={{ marginRight: 6 }}>
                  {isFolder ? '📁' : '📄'}
                </span>

                {file.name}
              </td>

              {/* TYPE */}
              <td>
                {file.type}
              </td>

              {/* MODIFIED */}
              <td>
                {file.modified
                  ? new Date(file.modified).toLocaleString()
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