//main.jsx
// App (state + handlers)
//   ↓
// WorkspaceLayout (wiring only)
//   ↓
// DestinationPanel (pass-through)
//   ↓
// DestinationNode (triggers)

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import WorkspaceLayout from './WorkspaceLayout';
import './index.css';

import PreviewPane from './components/PreviewPane';
import DestinationPanel from './components/DestinationPanel';
import ContextMenu from './components/ContextMenu';
import { handleFileAction } from './utils/fileActions';
import TopBar from './components/TopBar';

import { theme } from './styles/theme';

function App() {
  const [tree, setTree] = useState({});
  const [destRoot, setDestRoot] = useState(null);

  const [selectedDestFile, setSelectedDestFile] = useState(null);
  const [previewDestFile, setPreviewDestFile] = useState(null);

  const [destinations, setDestinations] = useState([]);
  const [newDestName, setNewDestName] = useState("");

  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  const [creatingFolder, setCreatingFolder] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  // 🔥 Finder-style navigation state : using stack
  const [pathStack, setPathStack] = useState([]);

  const currentPath = pathStack[pathStack.length - 1] || null;
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [viewMode, setViewMode] = useState('list'); // 'grid'

  // ---------------- SYNC ROOT ----------------
  // 🔥 ONLY reset stack on root change
  useEffect(() => {
    if (destRoot) {
      setPathStack([destRoot]); // 🔥 initialize stack
      setPreviewDestFile(null);
    }
  }, [destRoot]);

  // 🔥 clear preview on navigation
  useEffect(() => {
    setPreviewDestFile(null);
  }, [destRoot, currentPath]);

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

    if (destinations.some(d => d.path === dir)) {
      setDestRoot(dir); // switch instead of ignoring
      return;
    }

    const newDest = { name, path: dir, checked: true };

    // setDestinations(prev => [...prev, newDest]);
    // setDestRoot(dir);
    setDestinations(prev => [...prev, newDest]);
    // only set root if first destination
    setDestRoot(prev => prev ?? dir);

    setNewDestName("");

    await withLoading(async () => {
      const children = await window.api.listDirectory(dir);

      setTree(prev => ({
        ...prev,
        [dir]: children
      }));
    });
  };

  // ---------------- ACTION HANDLER ----------------
  const handleAction = (payload) => {
    handleFileAction(payload, {
      setTree,
      currentPath   // 🔥 ensures refresh happens in correct folder
    });
  };

  // ---------------- OPEN FILE ----------------
  const openFile = async (file) => {
    await window.api.openFile(file.path);
  };

  const handlePreview = (file) => {
    if (!file || file.type === 'folder') return;
    setPreviewDestFile(file);
  };
  

  // const handleContextMenu = (file, e) => {
  //   setContextMenu({
  //     x: e.clientX,
  //     y: e.clientY,
  //     file
  //   });
  // };
  const handleContextMenu = (file, e) => {
    e.stopPropagation(); // 🔥 prevent double execution
  
    // 🔥 if empty space → fallback to current folder
    const target = file ?? {
      path: currentPath,
      type: 'folder',
      isContainer: true
    };
  
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file: target
    });
  };

  // ---------------- UI ----------------
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: theme.bg,
color: theme.text, overflow:'hidden'
 }}>

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
      <TopBar
        newDestName={newDestName}
        setNewDestName={setNewDestName}
        onAdd={selectDest}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* MAIN */}
      {/* ------------------------------------------- */}
      <div
        style={{
          flex: 1,
          minHeight: 0,     // 🔥 THIS is what enables inner scrolling
          display: 'flex'
        }}
      >
        <WorkspaceLayout
          viewMode={viewMode}

          destinations={destinations}
          destRoot={destRoot}
          setDestRoot={setDestRoot}

          tree={tree}
          setTree={setTree}

          currentPath={currentPath}
          pathStack={pathStack}
          setPathStack={setPathStack}

          selectedDestFile={selectedDestFile}
          setSelectedDestFile={setSelectedDestFile}

          previewDestFile={previewDestFile}
          setPreviewDestFile={setPreviewDestFile}

          openFile={openFile}
          handleAction={handleAction}

          creatingFolder={creatingFolder}
          setCreatingFolder={setCreatingFolder}

          setContextMenu={setContextMenu}

          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}

        
    handlePreview={handlePreview}           // 🔥 FIXED
          handleContextMenu={handleContextMenu}   // 🔥 FIXED
        />

      </div>
      
        {/* CONTEXT MENU */}
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onPreview={(file) => setPreviewDestFile(file)}
          onMove={handleAction}
          setCreatingFolder={setCreatingFolder}
          clipboard={clipboard}
          setClipboard={setClipboard}
          currentPath={currentPath}

        />
      
      
    </div>

   

  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);