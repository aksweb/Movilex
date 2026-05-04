// hooks/usePanZoom.js

import { useRef, useState, useEffect } from 'react';

export function usePanZoom(containerRef) {
  const [zoom, setZoom] = useState(1);              // fast visual zoom
  const [renderScale, setRenderScale] = useState(1); // debounced render scale
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, sl: 0, st: 0 });

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  // ---------- PINCH ZOOM (SMOOTH + STABLE) ----------
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
  
    const pointers = new Map();
  
    let initialDistance = 0;
    let initialZoom = 1;
  
    const getDistance = () => {
      const pts = Array.from(pointers.values());
      const dx = pts[0].x - pts[1].x;
      const dy = pts[0].y - pts[1].y;
      return Math.hypot(dx, dy);
    };
  
    const getCenter = () => {
      const pts = Array.from(pointers.values());
      return {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2
      };
    };
  
    const onPointerDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    };
  
    const onPointerMove = (e) => {
      if (!pointers.has(e.pointerId)) return;
  
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  
      if (pointers.size === 2) {
        const rect = el.getBoundingClientRect();
  
        const distance = getDistance();
        const center = getCenter();
  
        if (!initialDistance) {
          initialDistance = distance;
          initialZoom = zoomRef.current;
          return;
        }
  
        const scaleFactor = distance / initialDistance;
  
        const nextZoom = Math.min(
          5,
          Math.max(0.2, initialZoom * scaleFactor)
        );
  
        const cx = (center.x - rect.left + el.scrollLeft) / zoomRef.current;
        const cy = (center.y - rect.top + el.scrollTop) / zoomRef.current;
  
        setZoom(nextZoom);
  
        el.scrollLeft = cx * nextZoom - (center.x - rect.left);
        el.scrollTop  = cy * nextZoom - (center.y - rect.top);
      }
    };
  
    const onPointerUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) {
        initialDistance = 0;
      }
    };
  
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
  
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  // ---------- DEBOUNCED HIGH-QUALITY RENDER ----------
  useEffect(() => {
    const id = setTimeout(() => {
      setRenderScale(zoomRef.current);
    }, 120); // tweak: 80–160

    return () => clearTimeout(id);
  }, [zoom]);

  // ---------- DRAG TO PAN ----------
  const onMouseDown = (e) => {
    if (e.button !== 0 || zoomRef.current <= 1) return;

    setIsDragging(true);

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      sl: containerRef.current.scrollLeft,
      st: containerRef.current.scrollTop
    };
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    containerRef.current.scrollLeft = dragStart.current.sl - dx;
    containerRef.current.scrollTop  = dragStart.current.st - dy;
  };

  const onMouseUp = () => setIsDragging(false);

  return {
    zoom,
    renderScale,
    setZoom,
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUp
  };
}