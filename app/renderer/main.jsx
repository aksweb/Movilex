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
import MoveToast from './components/MoveToast';
import { usePersistentState } from '../renderer/components/hooks/usePersistentState.js';

import { theme } from './styles/theme';


function App() {
  // ================= PERSISTENT STATE =================
  const [destinations, setDestinations] = usePersistentState(
    "destinations",
    [],
    { debounce: 100 }
  );

  const [destRoot, setDestRoot] = usePersistentState(
    "destRoot",
    null
  );

  const [pathStack, setPathStack] = usePersistentState(
    "pathStack",
    []
  );

  const [isSidebarOpen, setIsSidebarOpen] = usePersistentState(
    "sidebar",
    true
  );

  // ================= VALIDATE ROOT =================
  useEffect(() => {
    if (!destRoot) return;

    const exists = destinations.some(d => d.path === destRoot);

    if (!exists) {
      setDestRoot(destinations[0]?.path || null);
    }
  }, [destinations, destRoot]);

  // ================= NORMAL STATE =================
  const [tree, setTree] = useState({});
  const [selectedDestFile, setSelectedDestFile] = useState(null);
  const [previewDestFile, setPreviewDestFile] = useState(null);

  const [newDestName, setNewDestName] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [loading, setLoading] = useState(false);

  const [creatingFolder, setCreatingFolder] = useState(null);
  const [clipboard, setClipboard] = useState(null);

  const currentPath = pathStack[pathStack.length - 1] || null;

  const [viewMode, setViewMode] = useState('list');
  const [moveToast, setMoveToast] = useState(null);

  // ================= SYNC ROOT (FIXED) =================
  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    // 🔥 skip initial restore
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    if (destRoot) {
      setPathStack([destRoot]);
      setPreviewDestFile(null);
    }
  }, [destRoot]);

  // ================= CLEAR PREVIEW =================
  useEffect(() => {
    setPreviewDestFile(null);
  }, [destRoot, currentPath]);

  // ================= LOADER =================
  const withLoading = async (fn) => {
    if (loading) return;
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD FOLDER =================
  const loadFolder = async (folderPath) => {
    const children = await window.api.listDirectory(folderPath);

    setTree(prev => ({
      ...prev,
      [folderPath]: children
    }));
  };

  // ================= CREATE DESTINATION =================
  const selectDest = async () => {
    const dir = await window.api.selectDestinationFolder();
    if (!dir) return;

    const name = newDestName || dir.split('/').pop();

    if (destinations.some(d => d.path === dir)) {
      setDestRoot(dir);
      return;
    }

    const newDest = { name, path: dir, checked: true };

    setDestinations(prev => [...prev, newDest]);
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

  // ================= ACTION HANDLER =================
  const handleAction = (payload) => {
    handleFileAction(payload, {
      setTree,
      currentPath,
      setMoveToast,
      setPreviewDestFile
    });
  };

  // ================= FILE HANDLERS =================
  const openFile = async (file) => {
    await window.api.openFile(file.path);
  };

  const handlePreview = (file) => {
    if (!file || file.type === 'folder') return;
    setPreviewDestFile(file);
  };

  const handleRemoveDestination = (path) => {
    setDestinations(prev => {
      const next = prev.filter(d => d.path !== path);

      if (path === destRoot) {
        setDestRoot(next.length ? next[0].path : null);
      }

      return next;
    });
  };

  // ================= CONTEXT MENU =================
  const handleContextMenu = (file, e) => {
    e.stopPropagation();

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

  // ================= NAVIGATION =================
  const buildStack = (path, root) => {
    if (!path || !root) return [];

    if (!path.startsWith(root)) return [root];

    const relative = path.slice(root.length).split('/').filter(Boolean);

    const stack = [root];
    let current = root;

    for (const part of relative) {
      current = current + '/' + part;
      stack.push(current);
    }

    return stack;
  };

  const handleNavigate = async (path) => {
    if (!path || !destRoot) return;

    if (!path.startsWith(destRoot)) {
      console.warn("Blocked navigation outside destination:", path);
      return;
    }

    await loadFolder(path);
    setPathStack(buildStack(path, destRoot));
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
          handleRemoveDestination={handleRemoveDestination}   // ✅ ADD


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

          loadFolder={loadFolder}
        />

      </div>
      
        {/* CONTEXT MENU */}
        <ContextMenu
          menu={contextMenu}
          destinations={destinations}
          tree={tree}
          loadFolder={loadFolder}
          onClose={() => setContextMenu(null)}
          onPreview={(file) => setPreviewDestFile(file)}
          onMove={handleAction}
          setCreatingFolder={setCreatingFolder}
          clipboard={clipboard}
          setClipboard={setClipboard}
          currentPath={currentPath}

        />
        <MoveToast
          toast={moveToast}
          onClose={() => setMoveToast(null)}
          onNavigate={handleNavigate}
        />
      
      
    </div>

   

  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);