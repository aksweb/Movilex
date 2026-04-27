import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import PreviewPane from './components/PreviewPane';
import FileTable from './components/FileTable';
import DestinationTree from './components/DestinationTree';
import ContextMenu from './components/ContextMenu';

function App() {
  const [tree, setTree] = useState({});
  const [sourceRoot, setSourceRoot] = useState(null);
  const [destRoot, setDestRoot] = useState(null);

  const [loading, setLoading] = useState(false);

  const [expandedSource, setExpandedSource] = useState(new Set());
  const [expandedDest, setExpandedDest] = useState(new Set());

  const [selectedSourceFile, setSelectedSourceFile] = useState(null);
  const [selectedDestFile, setSelectedDestFile] = useState(null);

  const [previewSourceFile, setPreviewSourceFile] = useState(null);
  const [previewDestFile, setPreviewDestFile] = useState(null);

  const [destinations, setDestinations] = useState([]);
  const [newDestName, setNewDestName] = useState("");

  const [contextMenu, setContextMenu] = useState(null);     /* { x, y, file } */


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

  // ---------------- SOURCE ----------------
  const selectSource = async () => {
    const dir = await window.api.selectFolder();
    if (!dir) return;
  
    setSourceRoot(dir);
  
    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);
  
      setTree(prev => ({
        ...prev,
        [dir]: children
      }));
  
      setExpandedSource(new Set([dir]));
    });
  };

  // ---------------- DESTINATION ----------------
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

  const toggleDestination = (path) => {
    setDestinations(prev =>
      prev.map(d =>
        d.path === path ? { ...d, checked: !d.checked } : d
      )
    );
  };

  // ---------------- TREE FLATTEN ----------------
  const flattenTree = (root) => {
    const result = [];

    const dfs = (path, depth = 0) => {
      const items = tree[path] || [];

      for (const item of items) {
        result.push({ ...item, depth });

        if (item.type === 'folder' && expandedSource.has(item.path)) {
          dfs(item.path, depth + 1);
        }
      }
    };

    if (root) dfs(root);
    return result;
  };

  // ---------------- FOLDER CREATION ----------------
  const createFolder = async (parentPath) => {
    const name = prompt("Enter folder name");
    if (!name) return;

    await window.api.createFolder({ parentPath, name });

    const children = await window.api.listDirectory(parentPath);

    setTree(prev => ({
      ...prev,
      [parentPath]: children
    }));
  };

  // ---------------- TOGGLE ----------------
  const toggleSourceFolder = async (path) => {
    if (expandedSource.has(path)) {
      setExpandedSource(prev => {
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

    setExpandedSource(prev => new Set(prev).add(path));
  };

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

  // ---------------- OPEN ----------------
  const openFile = async (file) => {
    await window.api.openFile(file.path || file.original_path);
  };
  // --------------- MOVE HANDLER ---------------
  const moveFileToDestination = async (file, destFolderPath) => {
    const sourcePath = file.path || file.original_path;
  
    if (!sourcePath || !destFolderPath) {
      console.error("Invalid move params:", { file, destFolderPath });
      return;
    }
  
    const res = await window.api.moveFile({
      sourcePath,
      destinationPath: destFolderPath
    });
  
    if (!res?.success) {
      console.error("Move failed:", res?.error);
      return;
    }
  
    // refresh destination
    const destChildren = await window.api.listDirectory(destFolderPath);
  
    // refresh source parent
    const sourceParent = sourcePath.substring(0, sourcePath.lastIndexOf('/'));
    const sourceChildren = await window.api.listDirectory(sourceParent);
  
    setTree(prev => ({
      ...prev,
      [destFolderPath]: destChildren,
      [sourceParent]: sourceChildren
    }));
  };

  // ---------------- UI ----------------
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

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
      <div style={{ height: '15vh', display: 'flex', borderBottom: '1px solid #ccc' }}>

        <div style={{ width: '20vw', padding: 10, borderRight: '1px solid #ccc' }}>
          <button onClick={selectSource}>Select Source</button>

          <div style={{ marginTop: 10 }}>
            <input
              placeholder="Destination name"
              value={newDestName}
              onChange={(e) => setNewDestName(e.target.value)}
            />
            <button onClick={selectDest}>Create Destination</button>
          </div>

          <div style={{ marginTop: 10 }}>
            <div>Source: {sourceRoot || "-"}</div>
            <div>
              Dest: {destinations.find(d => d.path === destRoot)?.name || "-"}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 10 }}>
          <button>Show Source Files</button>
          <button style={{ marginLeft: 10 }}>Show Destination Files</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, 
        display: 'flex', 
        minHeight: 0, 
        overflow: 'hidden' // 🔥 important
        }}>
        {/* SOURCE */}
        <div style={{
            width: '50%',
            position: 'relative',
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,        // 🔥 critical
            overflow: 'hidden'
          }}>
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 10,
              minHeight: 0         // 🔥 prevents overflow
            }}>
            <h4>Source</h4>

            <FileTable
              files={flattenTree(sourceRoot)}
              setSelectedFile={setSelectedSourceFile}
              openFile={openFile}
              selectedFile={selectedSourceFile}
              toggleFolder={toggleSourceFolder}
              expanded={expandedSource}
              onPreview={(file, event) => {
                setContextMenu({
                  x: event.clientX,
                  y: event.clientY,
                  file
                });
              }}
            />
          </div>

          {previewSourceFile && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '30%',
              width: '70%',
              height: '100%',
              background: '#fff',
              borderLeft: '1px solid #ccc'
            }}>
              <button onClick={() => setPreviewSourceFile(null)}>Close</button>
              <PreviewPane file={previewSourceFile} />
            </div>
          )}
        </div>

        {/* DEST */}
              <div style={{
                width: '50%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 0,
                overflow: 'hidden'
              }}>
          <div style={{ padding: 10, borderBottom: '1px solid #ccc' }}>
            <h4>Destinations</h4>
            {destinations.map(dest => (
              <div key={dest.path}>
                <input
                  type="checkbox"
                  checked={dest.checked}
                  onChange={() => toggleDestination(dest.path)}
                />
                {dest.name}
              </div>
            ))}
          </div>

          <div style={{
              flex: 1,
              overflow: 'auto',
              padding: 10,
              minHeight: 0
            }}>
            {destinations.filter(d => d.checked).map(dest => (
              <DestinationTree
                key={dest.path}
                tree={tree}
                destRoot={dest.path}
                expanded={expandedDest}
                toggleFolder={toggleDestFolder}
                createFolder={createFolder}
                selectedFile={selectedDestFile}
                setSelectedFile={setSelectedDestFile}
                openFile={openFile}
                onPreview={setPreviewDestFile}
              />
            ))}
          </div>

          {previewDestFile && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '30%',
              width: '70%',
              height: '100%',
              background: '#fff',
              borderLeft: '1px solid #ccc'
            }}>
              <button onClick={() => setPreviewDestFile(null)}>Close</button>
              <PreviewPane file={previewDestFile} />
            </div>
          )}
        </div>

      </div>

         {/* ContextMenu */}
      <ContextMenu
        menu={contextMenu}
        destinations={destinations}
        tree={tree}
        onClose={() => setContextMenu(null)}
        onPreview={(file) => {
          if (selectedSourceFile?.path === file.path) {
            setPreviewSourceFile(file);
          } else {
            setPreviewDestFile(file);
          }
        }}
        onMove={moveFileToDestination}
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);