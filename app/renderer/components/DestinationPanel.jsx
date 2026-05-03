//destinationPanel.jsx (Dont remove this file name)
import React from 'react';
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

  // ---------------- ITEMS ----------------
  let items = tree[normalizedPath];

  if (!items) {
    loadFolder(normalizedPath);
    items = [];
  }

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

  // ---------------- CREATE ----------------
  const handleCreate = async (name) => {
    if (!name.trim()) {
      setCreatingFolder(null);
      return;
    }

    await onMove({
      action: "create-folder",
      targetPath: normalizedPath,
      name
    });

    setCreatingFolder(null);
  };

  // ---------------- BACK (STACK BASED) ----------------
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

        onContextMenu(null, e); // 🔥 null = empty space intent

      }}
    >
      {/* PATH and BACK */}
      <DestinationHeader
        normalizedPath={normalizedPath}
        pathStack={pathStack}
        onBack={handleBack}
      />

      {/* LIST */}


      {viewMode === 'grid' ? (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px'
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