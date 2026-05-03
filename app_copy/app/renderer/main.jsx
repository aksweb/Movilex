import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

import PreviewPane from './components/PreviewPane';
import DestinationPanel from './components/DestinationPanel';
import ContextMenu from './components/ContextMenu';
import { handleFileAction } from './utils/fileActions';

function App() {
  const [tree, setTree] = useState({});
  const [destRoot, setDestRoot] = useState(null);

  const [expandedDest, setExpandedDest] = useState(new Set());
  const [selectedDestFile, setSelectedDestFile] = useState(null);
  const [previewDestFile, setPreviewDestFile] = useState(null);

  const [destinations, setDestinations] = useState([]);
  const [newDestName, setNewDestName] = useState("");

  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  const [creatingFolder, setCreatingFolder] = useState(null); // { parentPath, tempId } 

  const [clipboard, setClipboard] = useState(null); //for cut and copy


  // ---------------- LOADER ----------------
  const withLoading = async (fn) => {
    if (loading) return;
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  // ---------------- LOAD FOLDER ----------------
  const loadFolder = async (folderPath) => {
    if (tree[folderPath]) return;

    const children = await window.api.listDirectory(folderPath);

    setTree(prev => ({
      ...prev,
      [folderPath]: children
    }));
  };

  // ---------------- CREATE DESTINATION ----------------
  const selectDest = async () => {
    const dir = await window.api.selectDestinationFolder();
    if (!dir) return;

    const name = newDestName || dir.split('/').pop();

    if (destinations.some(d => d.path === dir)) return;

    const newDest = { name, path: dir, checked: true };

    setDestinations(prev => [...prev, newDest]);
    setDestRoot(dir);
    setNewDestName("");

    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);

      setTree(prev => ({
        ...prev,
        [dir]: children
      }));

      setExpandedDest(prev => new Set(prev).add(dir));
    });
  };

  // ---------------- TOGGLE DEST ----------------
  const toggleDestination = (path) => {
    setDestinations(prev =>
      prev.map(d =>
        d.path === path ? { ...d, checked: !d.checked } : d
      )
    );
  };

  // ---------------- TOGGLE FOLDER ----------------
  const toggleDestFolder = async (path) => {
    if (expandedDest.has(path)) {
      setExpandedDest(prev => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
      return;
    }

    if (!tree[path]) {
      const children = await window.api.listDirectory(path);
      setTree(prev => ({ ...prev, [path]: children }));
    }

    setExpandedDest(prev => new Set(prev).add(path));
  };

  // ---------------- ACTION HANDLER ----------------
  const handleAction = (payload) => {
    handleFileAction(payload, { setTree });
  };

  // ---------------- OPEN FILE ----------------
  const openFile = async (file) => {
    await window.api.openFile(file.path);
  };

  // ---------------- UI ----------------
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* LOADER */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          zIndex: 999
        }}>
          Loading...
        </div>
      )}

      {/* TOP BAR */}
      <div style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
        <input
          placeholder="Destination name"
          value={newDestName}
          onChange={(e) => setNewDestName(e.target.value)}
        />
        <button onClick={selectDest}>Create Destination</button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex' }}>

        {/* LEFT → DESTINATION */}
        <div style={{
          width: '40%',
          borderRight: '1px solid #ccc',
          overflow: 'auto',
          padding: 10
        }}>
          {destinations.filter(d => d.checked).map(dest => (
            <DestinationPanel
              key={dest.path}
              tree={tree}
              destRoot={dest.path}
              expanded={expandedDest}
              toggleFolder={toggleDestFolder}
              selectedFile={selectedDestFile}
              setSelectedFile={setSelectedDestFile}
              openFile={openFile}
              onPreview={(file, event) => {
                setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  file,
                  origin: "destination"
                });
              }}
              onMove={handleAction}
              creatingFolder={creatingFolder}
              setCreatingFolder={setCreatingFolder}
            />
          ))}
        </div>

        {/* RIGHT → PREVIEW */}
        <div style={{
          width: '60%',
          padding: 10,
          overflow: 'auto'
        }}>
          {previewDestFile ? (
            <PreviewPane file={previewDestFile} />
          ) : (
            <div style={{ color: '#888' }}>
              Select a file to preview
            </div>
          )}
        </div>

      </div>

      {/* CONTEXT MENU */}
      <ContextMenu
        menu={contextMenu}
        destinations={destinations}
        tree={tree}
        onClose={() => setContextMenu(null)}
        onPreview={(file) => setPreviewDestFile(file)}
        onMove={handleAction}
        loadFolder={loadFolder}
        setCreatingFolder={setCreatingFolder}
        clipboard={clipboard}
        setClipboard={setClipboard}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);