import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import PreviewPane from './components/PreviewPane';

function App() {
  const [tree, setTree] = useState({});
  const [sourceRoot, setSourceRoot] = useState(null);
  const [destRoot, setDestRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);

  // ---------- LOADING WRAPPER ----------
  const withLoading = async (fn) => {
    if (loading) return;

    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  // ---------- SELECT SOURCE ----------
  const selectSource = async () => {
    const dir = await window.api.selectFolder();
    if (!dir) return;

    setSourceRoot(dir);

    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);

      setTree({
        [dir]: children
      });

      setExpanded(new Set([dir]));
    });
  };

  // ---------- SELECT DEST ----------
  const selectDest = async () => {
    const dir = await window.api.selectDestinationFolder();
    if (!dir) return;

    setDestRoot(dir);
  };

  // ---------- TOGGLE FOLDER ----------
  const toggleFolder = async (folderPath) => {
    const isExpanded = expanded.has(folderPath);

    if (isExpanded) {
      setExpanded(prev => {
        const next = new Set(prev);
        next.delete(folderPath);
        return next;
      });
      return;
    }

    if (!tree[folderPath]) {
      await withLoading(async () => {
        const children = await window.api.listDirectory(folderPath);

        setTree(prev => ({
          ...prev,
          [folderPath]: children
        }));
      });
    }

    setExpanded(prev => new Set(prev).add(folderPath));
  };

  // ---------- MOVE FILE ----------
  const move = async (file, category) => {
    if (!destRoot) {
      alert("Select destination folder first");
      return;
    }

    await withLoading(async () => {
      await window.api.moveFile({
        id: file.id || 0,
        path: file.path || file.original_path,
        category,
        destRoot
      });
    });
  };

  // ---------- OPEN FILE ----------
  const openFile = async (file) => {
    await window.api.openFile(file.path || file.original_path);
  };

  // ---------- TREE RENDER ----------
  const renderTree = (path, level = 0) => {
    const items = tree[path] || [];

    return items.map(item => (
      <div key={item.path} style={{ paddingLeft: level * 14 }}>

        {item.type === 'folder' ? (
          <div
            onClick={() => toggleFolder(item.path)}
            style={{ cursor: 'pointer', fontWeight: 'bold' }}
          >
            {expanded.has(item.path) ? '▼' : '▶'} {item.name}
          </div>
        ) : (
          <div
            onClick={() => setSelectedFile(item)}   // ✅ IMPORTANT
            onDoubleClick={(e) => {
              e.stopPropagation();
              openFile(item);
            }}
            style={{
              userSelect: 'none',
              background: selectedFile?.path === item.path ? '#ddd' : 'transparent',
              padding: '2px'
            }}
          >
            {item.name}

            <button onClick={() => move(item, 'project_1')}>P1</button>
            <button onClick={() => move(item, 'project_2')}>P2</button>
            <button onClick={() => move(item, 'rejected')}>Reject</button>
            <button onClick={() => move(item, 'halt')}>Halt</button>
          </div>
        )}

        {expanded.has(item.path) && tree[item.path] &&
          renderTree(item.path, level + 1)}
      </div>
    ));
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>

      {/* -------- LOADER -------- */}
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

      {/* -------- LEFT: TREE -------- */}
      <div style={{ width: '40%', overflow: 'auto', padding: 10 }}>
        <button onClick={selectSource}>Select Source</button>
        <div>{sourceRoot || "No source selected"}</div>

        <button onClick={selectDest}>Select Destination</button>
        <div>{destRoot || "No destination selected"}</div>

        <div style={{ marginTop: 20 }}>
          {sourceRoot && renderTree(sourceRoot)}
        </div>
      </div>

      {/* -------- RIGHT: PREVIEW -------- */}
      <div style={{
        width: '40%',
        borderLeft: '2px solid #ccc',
        overflow: 'auto'
      }}>
        <PreviewPane file={selectedFile} />
      </div>
      {/* <div
      style={{
        width: '40%',
        height: '50vh',        // 🔥 key change
        borderLeft: '1px solid #ccc',
        overflow: 'hidden'     // 🔥 no overflow
      }}
>
  <PreviewPane file={selectedFile} />
</div> */}

    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);