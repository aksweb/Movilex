// DestinationNode
//  ├── onClick        → handlePreview(file)
//  ├── onContextMenu  → handleContextMenu(file, event)
//  └── onDoubleClick  → openFile(file)

// WorkspaceLayout
//  └── pure wiring layer

// App
//  └── owns state + handlers


import React from 'react';
import DestinationPanel from './components/DestinationPanel';
import PreviewPane from './components/PreviewPane';
import { theme } from './styles/theme';
import Sidebar from './components/Sidebar';

function WorkspaceLayout({
  viewMode,
  destinations,
  destRoot,
  setDestRoot,

  tree,
  setTree,

  currentPath,
  pathStack,
  setPathStack,

  selectedDestFile,
  setSelectedDestFile,

  previewDestFile,
  setPreviewDestFile,

  openFile,
  handleAction,

  creatingFolder,
  setCreatingFolder,

  setContextMenu,

  isSidebarOpen,
  setIsSidebarOpen,
  handlePreview,        // ✅ ADD
  handleContextMenu,    // ✅ ADD

  loadFolder,
  handleRemoveDestination
}) {

    const isPreviewOpen = !!previewDestFile; // 🔥 TRUE if preview is open


    
      return (
        <div
          style={{
            flex: 1,
            display: 'flex',
            height: '100%',
            overflow: 'hidden'   // 🔥 prevents global scroll
          }}
        >
    
          {/* ================= SIDEBAR ================= */}
          <Sidebar
            destinations={destinations}
            destRoot={destRoot}
            setDestRoot={setDestRoot}
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onRemoveDestination={handleRemoveDestination}   // ✅ ADD

            />
    
          {/* ================= DESTINATION PANEL ================= */}
          <div
            style={{
              width: isPreviewOpen ? '40%' : '100%',
    
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              overflow: 'hidden',
    
              borderRight: isPreviewOpen
                ? `1px solid ${theme.border}`
                : 'none'
            }}
          >
    
            {/* SCROLLABLE CONTENT */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                minHeight: 0,
                padding: 10
              }}
            >
              {destRoot && (
                <DestinationPanel
                  viewMode={viewMode}
                  tree={tree}
                  currentPath={currentPath}
                  pathStack={pathStack}
                  setPathStack={setPathStack}
                  selectedFile={selectedDestFile}
                  setSelectedFile={setSelectedDestFile}
                  openFile={openFile}
                  onPreview={handlePreview}
                  onContextMenu={handleContextMenu}
                  onMove={handleAction}
                  creatingFolder={creatingFolder}
                  setCreatingFolder={setCreatingFolder}
                  setTree={setTree}
                  root={destRoot}
                />
              )}
            </div>
          </div>
    
          {/* ================= PREVIEW ================= */}
          {isPreviewOpen && (
            <div
              style={{
                width: '60%',
    
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
    
                borderLeft: `1px solid ${theme.border}`
              }}
            >
    
              {/* HEADER (FIXED) */}
              <div
                style={{
                  padding: '6px 10px',
                  borderBottom: `1px solid ${theme.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <div style={{ fontWeight: 500 }}>
                  {previewDestFile.name}
                </div>
    
                <button
                  onClick={() => setPreviewDestFile(null)}
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: 'none',
                    color: theme.text
                  }}
                >
                  ✖
                </button>
              </div>
    
              {/* SCROLLABLE PREVIEW */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  minHeight: 0,
                  padding: 10
                }}
              >
                <PreviewPane
                  file={previewDestFile}
                  destinations={destinations}
                  tree={tree}
                  loadFolder={loadFolder}
                  onMove={handleAction}
                />
              </div>
            </div>
          )}
    
        </div>
      );
    }
    
    export default WorkspaceLayout;