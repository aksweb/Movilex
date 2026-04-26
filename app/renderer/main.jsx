import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import PreviewPane from './components/PreviewPane';
import FileTable from './components/FileTable';
import DestinationTree from './components/DestinationTree';

function App() {
  const [tree, setTree] = useState({});
  const [sourceRoot, setSourceRoot] = useState(null);
  const [destRoot, setDestRoot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedSource, setExpandedSource] = useState(new Set());
  const [expandedDest, setExpandedDest] = useState(new Set());
  const [newDestName, setNewDestName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSourceFile, setPreviewSourceFile] = useState(null);
const [previewDestFile, setPreviewDestFile] = useState(null);

const [destinations, setDestinations] = useState([]);
// [{ name, path, checked }]


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
  
    const name = dir.split('/').pop();
  
    const newDest = {
      name,
      path: dir,
      checked: true
    };
  
    // prevent duplicates
    if (destinations.some(d => d.path === dir)) return;
  
    setDestinations(prev => [...prev, newDest]);
  
    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);
  
      setTree(prev => ({
        ...prev,
        [dir]: children
      }));
  
      setExpandedDest(prev => new Set(prev).add(dir));
    });
  };

  //  toggleDestination visibility
  const toggleDestination = (path) => {
    setDestinations(prev =>
      prev.map(d =>
        d.path === path ? { ...d, checked: !d.checked } : d
      )
    );
  };


  //Expanding files and folders
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

  //create folder
  const createFolder = async (parentPath) => {
    try {
      const name = prompt("Enter folder name");
      if (!name) return;
  
      await window.api.createFolder({
        parentPath,
        name
      });
  
      const children = await window.api.listDirectory(parentPath);
  
      setTree(prev => ({
        ...prev,
        [parentPath]: children
      }));
  
    } catch (err) {
      console.error("Create folder failed:", err);
    }
  };


  //toggling of folders
  // const toggleFolder = async (folderPath) => {
  //   const isExpanded = expanded.has(folderPath);

  //   if (isExpanded) {
  //     setExpanded(prev => {
  //       const next = new Set(prev);
  //       next.delete(folderPath);
  //       return next;
  //     });
  //     return;
  //   }

  //   // lazy load
  //   if (!tree[folderPath]) {
  //     await withLoading(async () => {
  //       const children = await window.api.listDirectory(folderPath);

  //       setTree(prev => ({
  //         ...prev,
  //         [folderPath]: children
  //       }));
  //     });
  //   }

  //   setExpanded(prev => new Set(prev).add(folderPath));
  // };
  // SOURCE
    const toggleSourceFolder = async (folderPath) => {
      const isExpanded = expandedSource.has(folderPath);

      if (isExpanded) {
        setExpandedSource(prev => {
          const next = new Set(prev);
          next.delete(folderPath);
          return next;
        });
        return;
      }

      if (!tree[folderPath]) {
        await withLoading(async () => {
          const children = await window.api.listDirectory(folderPath);
          setTree(prev => ({ ...prev, [folderPath]: children }));
        });
      }

      setExpandedSource(prev => new Set(prev).add(folderPath));
    };

    // DESTINATION
    const toggleDestFolder = async (folderPath) => {
      const isExpanded = expandedDest.has(folderPath);

      if (isExpanded) {
        setExpandedDest(prev => {
          const next = new Set(prev);
          next.delete(folderPath);
          return next;
        });
        return;
      }

      if (!tree[folderPath]) {
        await withLoading(async () => {
          const children = await window.api.listDirectory(folderPath);
          setTree(prev => ({ ...prev, [folderPath]: children }));
        });
      }

      setExpandedDest(prev => new Set(prev).add(folderPath));
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
          {/* <button onClick={selectDest}>Create Destination</button> */}
          <div>
            <input
              type="text"
              placeholder="Destination name"
              value={newDestName}
              onChange={(e) => setNewDestName(e.target.value)}
            />

            <button onClick={selectDest}>
              Create Destination
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <div>Source: {sourceRoot || "-"}</div>
            <div> Dest: { destinations.find(d => d.path === destRoot)?.name || "-" }
            </div>
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
        {/* MAIN CONTENT (2 PANES ONLY) */}
<div style={{
  flex: 1,
  display: 'flex',
  minHeight: 0
}}>

  {/* LEFT → SOURCE */}
  <div style={{
    width: '50%',
    borderRight: '1px solid #ccc',
    position: 'relative',
    overflow: 'hidden'
  }}>

    {/* SOURCE LIST */}
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: 10
    }}>
      <h4>Source</h4>

      <FileTable
        files={flattenTree(sourceRoot)}
        setSelectedFile={(f) => {
          setSelectedFile(f);
          setPreviewSourceFile(f);
        }}
        openFile={openFile}
        selectedFile={selectedFile}
        toggleFolder={toggleSourceFolder}
        expanded={expandedSource}
      />
    </div>

    {/* SOURCE PREVIEW OVERLAY */}
    {previewSourceFile && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: '30%',   // 🔥 leaves 30% visible list
        width: '70%',
        height: '100%',
        background: '#fff',
        borderLeft: '1px solid #ccc',
        zIndex: 10
      }}>
        <button onClick={() => setPreviewSourceFile(null)}>
          Close
        </button>

        <PreviewPane file={previewSourceFile} />
      </div>
    )}

  </div>

  {/* RIGHT → DESTINATION */}
  <div style={{
    width: '50%',
    position: 'relative',
    overflow: 'hidden'
  }}>

    {/* DEST TREE */}
    <div style={{
      height: '100%',
      overflow: 'auto',
      padding: 10
    }}>

    {/* //right  */}
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

      <h4>Destinations</h4>

      {destinations.filter(d => d.checked)
        .map(dest => (
          <DestinationTree
            key={dest.path}
            tree={tree}
            destRoot={dest.path}
            expanded={expandedDest}
            toggleFolder={toggleDestFolder}
            createFolder={createFolder}
            openFile={(file) => setPreviewDestFile(file)}
          />
        ))}
    </div>

    {/* DEST PREVIEW OVERLAY */}
    {previewDestFile && (
      <div style={{
        position: 'absolute',
        top: 0,
        left: '30%',
        width: '70%',
        height: '100%',
        background: '#fff',
        borderLeft: '1px solid #ccc',
        zIndex: 10
      }}>
        <button onClick={() => setPreviewDestFile(null)}>
          Close
        </button>

        <PreviewPane file={previewDestFile} />
      </div>
    )}

  </div>

</div>

          {/* RIGHT PANEL : make similar as per left panel but for destination folder: 
          At starting user has to select the destination folder to view it and it should recall 
          the last used location */}
        
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);