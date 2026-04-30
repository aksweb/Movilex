// renderer/utils/dragDrop.js

// ---------- CREATE DRAG PAYLOAD ----------
export function createDragPayload(item) {
    return JSON.stringify({
      path: item.path || item.original_path,
      type: item.type
    });
  }
  
  // ---------- PARSE PAYLOAD ----------
  export function parseDragPayload(e) {
    try {
      return JSON.parse(
        e.dataTransfer.getData('application/json')
      );
    } catch {
      return null;
    }
  }
  
  // ---------- GET TARGET FOLDER ----------
  export function resolveTargetFolder(item) {
    if (item.type === 'folder') return item.path;
  
    const idx = item.path.lastIndexOf('/');
    return idx > 0 ? item.path.substring(0, idx) : item.path;
  }
  
  // ---------- GUARDS ----------
  export function isInvalidMove(sourcePath, targetPath) {
    if (!sourcePath || !targetPath) return true;
  
    // same location
    if (sourcePath === targetPath) return true;
  
    // recursive move
    if (sourcePath.startsWith(targetPath + '/')) return true;
  
    return false;
  }