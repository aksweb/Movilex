//fileActions.js (Dont remove this file name)

export async function handleFileAction(payload, ctx) {
  const { setTree } = ctx;

  // 🔥 SAFE PARENT HELPER (critical)
  const getParent = (p) => {
    if (!p) return null;
    const idx = p.lastIndexOf('/');
    if (idx <= 0) return null;
    return p.substring(0, idx);
  };

  try {
    if (!payload.action) {
      console.error("Missing action in payload:", payload);
      return;
    }

    // ================= MOVE =================
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

      const parentSource = getParent(sourcePath);
      const parentOfSource = getParent(parentSource);

      // 🔥 THIS IS WHERE pathsToRefresh GOES
      const pathsToRefresh = new Set(
        [parentSource, parentOfSource, targetPath].filter(Boolean)
      );

      const updates = await Promise.all(
        Array.from(pathsToRefresh).map(async (p) => {
          const list = await window.api.listDirectory(p);
          return { path: p, list };
        })
      );

      setTree(prev => {
        const next = { ...prev };
        updates.forEach(u => {
          next[u.path] = u.list;
        });
        return next;
      });
    }

    // ================= DELETE =================
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

      const parent = getParent(targetPath);
      const parentOfParent = getParent(parent);

      const pathsToRefresh = [parent, parentOfParent].filter(Boolean);

      const updates = await Promise.all(
        pathsToRefresh.map(async (p) => ({
          path: p,
          list: await window.api.listDirectory(p)
        }))
      );

      setTree(prev => {
        const next = { ...prev };
        updates.forEach(u => {
          next[u.path] = u.list;
        });
        return next;
      });
    }

    // ================= CREATE FOLDER =================
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

      const parentOfTarget = getParent(targetPath);

      const pathsToRefresh = [targetPath, parentOfTarget].filter(Boolean);

      const updates = await Promise.all(
        pathsToRefresh.map(async (p) => ({
          path: p,
          list: await window.api.listDirectory(p)
        }))
      );

      setTree(prev => {
        const next = { ...prev };
        updates.forEach(u => {
          next[u.path] = u.list;
        });
        return next;
      });
    }

    // ================= PASTE =================
    else if (payload.action === "paste") {
      const { targetPath, clipboard } = payload;
      if (!clipboard?.items?.length) return;

      for (const sourcePath of clipboard.items) {
        if (clipboard.type === "cut") {
          await window.api.fileAction({
            action: "move",
            sourcePath,
            targetPath
          });
        } else if (clipboard.type === "copy") {
          await window.api.fileAction({
            action: "copy",
            sourcePath,
            targetPath
          });
        }
      }

      const updated = await window.api.listDirectory(targetPath);

      setTree(prev => ({
        ...prev,
        [targetPath]: updated
      }));
    }

    // ================= INTERNAL =================
    else if (payload.action === "__internal_update_tree__") {
      setTree(prev => ({
        ...prev,
        [payload.path]: payload.children
      }));
    }

    // ================= PROMPT =================
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