import React from 'react';

function FileTable({ files, setSelectedFile, openFile, selectedFile }) {

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

          return (
            <tr
              key={file.path}
              onClick={() => setSelectedFile(file)}
              onDoubleClick={() => openFile(file)}
              style={{
                cursor: 'pointer',
                borderBottom: '1px solid #eee',
                backgroundColor: isSelected ? '#dbeafe' : 'transparent' // 🔵 highlight
              }}
            >
              {/* NAME (wrapped properly) */}
              <td style={{
                wordBreak: 'break-word',
                whiteSpace: 'normal',
                overflowWrap: 'anywhere'
              }}>
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