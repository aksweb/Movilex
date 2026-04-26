import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import PreviewPane from './components/PreviewPane';
import FileTable from './components/FileTable';

function App() {
  const [tree, setTree] = useState({});
  const [sourceRoot, setSourceRoot] = useState(null);
  const [destRoot, setDestRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);

  const withLoading = async (fn) => {
    if (loading) return;
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  const selectSource = async () => {
    const dir = await window.api.selectFolder();
    if (!dir) return;

    setSourceRoot(dir);

    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);
      setTree({ [dir]: children });
      setExpanded(new Set([dir]));
    });
  };

  const selectDest = async () => {
    const dir = await window.api.selectDestinationFolder();
    if (!dir) return;
    setDestRoot(dir);
  };

  const flattenTree = (root) => {
    const result = [];

    const dfs = (path) => {
      const items = tree[path] || [];

      for (const item of items) {
        if (item.type === 'file') {
          result.push(item);
        } else if (item.type === 'folder') {
          dfs(item.path);
        }
      }
    };

    if (root) dfs(root);
    return result;
  };

  const openFile = async (file) => {
    await window.api.openFile(file.path || file.original_path);
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden' // 🔥 CRITICAL: disables page scroll
      }}
    >

      {/* LOADER */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '20px',
          zIndex: 999
        }}>
          Loading...
        </div>
      )}

      {/* TOP BAR */}
      <div style={{
        height: '15vh',
        display: 'flex',
        borderBottom: '1px solid #ccc',
        flexShrink: 0
      }}>

        {/* LEFT */}
        <div style={{
          width: '20vw',
          padding: 10,
          borderRight: '1px solid #ccc'
        }}>
          <button onClick={selectSource}>Select Source</button>
          <br />
          <button onClick={selectDest}>Create Destination</button>

          <div style={{ marginTop: 10 }}>
            <div>Source: {sourceRoot || "-"}</div>
            <div>Dest: {destRoot || "-"}</div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1, padding: 10 }}>
          <button>Show Source Files</button>
          <button style={{ marginLeft: 10 }}>Show Destination Files</button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div style={{
        flex: 1,
        display: 'flex',
        minHeight: 0 // 🔥 FIX flex overflow
      }}>

        {/* LEFT PANEL */}
        <div style={{
          width: '20vw',
          borderRight: '1px solid #ccc',
          padding: 10,
          overflow: 'auto',
          minHeight: 0
        }}>
          <h4>Destinations</h4>
          <div>Coming soon...</div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0 // 🔥 IMPORTANT
        }}>

          {/* FILE PANEL */}
          <div style={{
            width: '40vw',
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            minHeight: 0
          }}>

            {/* HEADER */}
            <div style={{
              padding: 10,
              borderBottom: '1px solid #ccc',
              flexShrink: 0
            }}>
              <h4>Files</h4>
            </div>

            {/* SCROLL AREA */}
            <div style={{
              flex: 1,
              overflow: 'auto', // 🔥 ONLY SCROLL HERE
              padding: 10,
              minHeight: 0
            }}>
              <FileTable
                files={flattenTree(sourceRoot)}
                setSelectedFile={setSelectedFile}
                openFile={openFile}
                selectedFile={selectedFile}
              />
            </div>

          </div>

          {/* PREVIEW PANEL */}
          <div style={{
            width: '40vw',
            overflow: 'hidden',
            height: '100%',
            minHeight: 0
          }}>
            <PreviewPane file={selectedFile} />
          </div>

        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);