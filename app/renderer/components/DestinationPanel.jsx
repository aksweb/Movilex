// destinationPanel.jsx (Dont remove this file name)

import React, { useEffect } from 'react';
import DestinationNode from './DestinationNode';
import { theme } from '../styles/theme';
import DestinationHeader from './DestinationHeader';

function DestinationPanel({
  viewMode,
  tree,
  currentPath,
  pathStack,
  setPathStack,
  selectedFile,
  setSelectedFile,
  openFile,
  onPreview,
  onContextMenu,
  onMove,
  creatingFolder,
  setCreatingFolder,
  setTree,
  root
}) {

  const normalizePath = (p) => {
    if (!p) return p;
    return p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p;
  };

  const normalizedPath = normalizePath(currentPath);

  // ---------------- LOAD ----------------
  const loadFolder = async (path) => {
    const normalized = normalizePath(path);

    const children = await window.api.listDirectory(normalized);

    setTree(prev => ({
      ...prev,
      [normalized]: children
    }));
  };

  // 🔥 FIX 1: move async out of render
  useEffect(() => {
    if (!tree[normalizedPath]) {
      loadFolder(normalizedPath);
    }
  }, [normalizedPath]);

  // ---------------- ITEMS ----------------
  let items = tree[normalizedPath] || [];

  // ---------------- TEMP FOLDER ----------------
  if (
    creatingFolder &&
    normalizePath(creatingFolder.parentPath) === normalizedPath
  ) {
    items = [
      {
        path: creatingFolder.tempId,
        name: "",
        type: "folder",
        isTemp: true
      },
      ...items
    ];
  }

  // 🔥 FIX 2: auto-clean temp folder when navigating away
  useEffect(() => {
    if (!creatingFolder) return;

    if (normalizePath(creatingFolder.parentPath) !== normalizedPath) {
      setCreatingFolder(null);
    }
  }, [normalizedPath]);

  // ---------------- CREATE ----------------
  const handleCreate = async (name) => {
    const cleanName = name.trim();
  
    if (!cleanName) {
      setCreatingFolder(null);
      return;
    }
  
    // 🔥 DUPLICATE CHECK
    const exists = (tree[normalizedPath] || []).some(
      item =>
        item.type === 'folder' &&
        item.name.toLowerCase() === cleanName.toLowerCase()
    );
  
    if (exists) {
      // 🔥 notify user (reuse your toast system)
      onMove({
        action: "__notify__",
        message: `Folder "${cleanName}" already exists`
      });
  
      setCreatingFolder(null);
      return;
    }
  
    await onMove({
      action: "create-folder",
      targetPath: normalizedPath,
      name: cleanName
    });
  
    setCreatingFolder(null);
  };

  // ---------------- BACK ----------------
  const handleBack = () => {
    setPathStack(prev => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  };

  return (
    <div
      style={{ padding: 8, background: theme.bg }}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu(null, e);
      }}
    >

      {/* HEADER */}
      <DestinationHeader
        normalizedPath={normalizedPath}
        pathStack={pathStack}
        onBack={handleBack}

        // 🔥 FIX 3: prevent multiple temp folders
        onCreateFolder={() => {
          if (creatingFolder) return;

          setCreatingFolder({
            parentPath: normalizedPath,
            tempId: "temp-" + Date.now()
          });
        }}
      />

      {/* LIST */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: 10
          }}
        >
          {items.map(item => (
            <DestinationNode
              key={item.path}
              item={item}
              currentPath={normalizedPath}
              pathStack={pathStack}
              setPathStack={setPathStack}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              openFile={openFile}
              onPreview={onPreview}
              onContextMenu={onContextMenu}
              onMove={onMove}
              isTemp={item.isTemp}
              onCreate={handleCreate}
              cancelCreate={() => setCreatingFolder(null)}
              loadFolder={loadFolder}
              viewMode="grid"
            />
          ))}
        </div>
      ) : (
        <div>
          {items.map(item => (
            <DestinationNode
              key={item.path}
              item={item}
              currentPath={normalizedPath}
              pathStack={pathStack}
              setPathStack={setPathStack}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              openFile={openFile}
              onPreview={onPreview}
              onContextMenu={onContextMenu}
              onMove={onMove}
              isTemp={item.isTemp}
              onCreate={handleCreate}
              cancelCreate={() => setCreatingFolder(null)}
              loadFolder={loadFolder}
              viewMode="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DestinationPanel;