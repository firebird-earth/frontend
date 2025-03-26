import { useState, useEffect, MouseEvent as ReactMouseEvent, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

interface UseDraggableOptions {
  initialPosition?: Position;
  padding?: number;
  initialCorner?: 'center' | 'bottom-right';
}

export function useDraggable({ 
  initialPosition, 
  padding = 25,
  initialCorner = 'bottom-right'
}: UseDraggableOptions = {}) {
  const [position, setPosition] = useState<Position>(initialPosition || { x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<Position | null>(null);
  const initializedRef = useRef(false);

  // Initialize position
  useEffect(() => {
    if (!dialogRef.current || initializedRef.current) return;

    const dialog = dialogRef.current;
    const rect = dialog.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Set initial position based on corner preference
    let initialX: number;
    let initialY: number;

    if (initialCorner === 'bottom-right') {
      initialX = viewport.width - rect.width - padding;
      initialY = viewport.height - rect.height - padding;
    } else {
      initialX = (viewport.width - rect.width) / 2;
      initialY = (viewport.height - rect.height) / 2;
    }

    // Set position immediately
    dialog.style.left = `${initialX}px`;
    dialog.style.top = `${initialY}px`;
    setPosition({ x: initialX, y: initialY });
    initializedRef.current = true;
  }, [padding, initialCorner]);

  // Handle drag start
  const handleMouseDown = (e: ReactMouseEvent<HTMLElement>) => {
    const dragHandle = (e.target as HTMLElement).closest('.drag-handle');
    if (!dragHandle || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const rect = dialog.getBoundingClientRect();

    dragStartRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drag movement
  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const rect = dialog.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    const newPosition = {
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    };

    // Constrain to viewport bounds with padding
    const constrainedPosition = {
      x: Math.min(Math.max(newPosition.x, padding), viewport.width - rect.width - padding),
      y: Math.min(Math.max(newPosition.y, padding), viewport.height - rect.height - padding)
    };

    setPosition(constrainedPosition);
    e.preventDefault();
  };

  // Handle drag end
  const handleMouseUp = (e: MouseEvent) => {
    dragStartRef.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    e.preventDefault();
  };

  // Prevent click propagation
  const handleDialogClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
  };

  return {
    position,
    handleMouseDown,
    handleDialogClick,
    dialogRef
  };
}