export async function handleFileAction(payload, ctx) {
    const { setTree } = ctx;
  
    try {
      if (!payload.action) {
        console.error("Missing action in payload:", payload);
        return;
      }
      // ---------------- MOVE ----------------
      if (payload.action === "move") {
        const { sourcePath, targetPath } = payload;
  
        if (!sourcePath || !targetPath) {
          console.error("Invalid move params:", payload);
          return;
        }
  
        const res = await window.api.fileAction({
          action: "move",
          sourcePath,
          targetPath
        });
  
        if (!res?.success) {
          console.error("Move failed:", res?.error);
          return;
        }
  
        const parentSource = sourcePath.substring(0, sourcePath.lastIndexOf('/'));
  
        const [updatedSource, updatedTarget] = await Promise.all([
          window.api.listDirectory(parentSource),
          window.api.listDirectory(targetPath)
        ]);
  
        setTree(prev => ({
          ...prev,
          [parentSource]: updatedSource,
          [targetPath]: updatedTarget
        }));
      }
  
      // ---------------- DELETE ----------------
      else if (payload.action === "delete") {
        const { targetPath } = payload;
  
        if (!targetPath) return;
  
        const res = await window.api.fileAction({
          action: "delete",
          targetPath
        });
  
        if (!res?.success) {
          console.error("Delete failed:", res?.error);
          return;
        }
  
        const parent = targetPath.substring(0, targetPath.lastIndexOf('/'));
  
        const updated = await window.api.listDirectory(parent);
  
        setTree(prev => ({
          ...prev,
          [parent]: updated
        }));
      }
  
      // ---------------- CREATE FOLDER ----------------
      else if (payload.action === "create-folder") {
        const { targetPath, name } = payload;
  
        if (!targetPath || !name) return;
  
        const res = await window.api.fileAction({
          action: "create-folder",
          targetPath,
          name
        });
  
        if (!res?.success) {
          console.error("Create failed:", res?.error);
          return;
        }
  
        const updated = await window.api.listDirectory(targetPath);
  
        setTree(prev => ({
          ...prev,
          [targetPath]: updated
        }));
      }
  
      // ---------------- TEMP PROMPT ----------------
      else if (payload.action === "open-create-folder") {
        const name = window.prompt("Folder name");
        if (!name) return;
  
        return handleFileAction(
          {
            action: "create-folder",
            targetPath: payload.targetPath,
            name
          },
          ctx
        );
      }
  
    } catch (err) {
      console.error("Action failed:", err);
    }
  }