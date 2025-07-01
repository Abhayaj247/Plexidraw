import React, { useRef, useEffect, useState, useCallback } from 'react';
import { DrawingElement, Point } from '../types/canvas';

interface CanvasProps {
  elements: DrawingElement[];
  selectedTool: string;
  selectedElementId: string | null;
  zoom: number;
  pan: Point;
  onElementsChange: (elements: DrawingElement[]) => void;
  onCreate: (element: DrawingElement) => void;
  onElementSelect: (elementId: string | null) => void;
  onPanChange: (pan: Point) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  sendDrawingEvent: (event: import('../hooks/useDrawingSocket').DrawingEvent) => void;
  roomId: number;
  toolsDisabled?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedTool,
  selectedElementId,
  zoom,
  pan,
  onElementsChange,
  onCreate,
  onElementSelect,
  onPanChange,
  canvasRef,
  strokeColor,
  strokeWidth,
  opacity,
  fontSize,
  fontFamily,
  textAlign,
  sendDrawingEvent,
  roomId,
  toolsDisabled = false,
}: CanvasProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);
  const [showTempEraseTooltip, setShowTempEraseTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to full window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom / 100, zoom / 100);

    // Draw elements
    elements.forEach((element) => {
      drawElement(ctx, element);
    });

    // Draw current element if drawing
    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, zoom, pan]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.globalAlpha = element.style.opacity / 100;
    ctx.strokeStyle = element.style.stroke;
    ctx.lineWidth = element.style.strokeWidth;
    ctx.fillStyle = element.style.fill;

    // Highlight selected element
    if (element.id === selectedElementId) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = element.style.strokeWidth + 2;
    }

    switch (element.type) {
      case 'rectangle':
        ctx.beginPath();
        ctx.rect(element.x, element.y, element.width, element.height);
        ctx.stroke();
        if (element.style.fill !== 'transparent') {
          ctx.fill();
        }
        break;

      case 'circle':
        ctx.beginPath();
        const radius = Math.sqrt(element.width ** 2 + element.height ** 2) / 2;
        ctx.arc(element.x + element.width / 2, element.y + element.height / 2, radius, 0, 2 * Math.PI);
        ctx.stroke();
        if (element.style.fill !== 'transparent') {
          ctx.fill();
        }
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        ctx.stroke();
        break;

      case 'arrow':
        ctx.beginPath();
        ctx.moveTo(element.x, element.y);
        ctx.lineTo(element.x + element.width, element.y + element.height);
        ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(element.height, element.width);
        const headLength = 15;
        ctx.beginPath();
        ctx.moveTo(element.x + element.width, element.y + element.height);
        ctx.lineTo(
          element.x + element.width - headLength * Math.cos(angle - Math.PI / 6),
          element.y + element.height - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(element.x + element.width, element.y + element.height);
        ctx.lineTo(
          element.x + element.width - headLength * Math.cos(angle + Math.PI / 6),
          element.y + element.height - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;

      case 'diamond':
        ctx.beginPath();
        const centerX = element.x + element.width / 2;
        const centerY = element.y + element.height / 2;
        ctx.moveTo(centerX, element.y);
        ctx.lineTo(element.x + element.width, centerY);
        ctx.lineTo(centerX, element.y + element.height);
        ctx.lineTo(element.x, centerY);
        ctx.closePath();
        ctx.stroke();
        if (element.style.fill !== 'transparent') {
          ctx.fill();
        }
        break;

      case 'pen':
        if (element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'text':
        if (!element.isEditing) {
          ctx.font = `${element.style.fontSize || 16}px ${element.style.fontFamily || 'Inter'}`;
          ctx.fillStyle = element.style.stroke;
          ctx.textAlign = element.style.textAlign || 'left';
          ctx.fillText(element.text || '', element.x, element.y + (element.style.fontSize || 16));
        }
        break;
    }

    ctx.globalAlpha = 1;
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    return {
      x: (e.clientX - rect.left - pan.x) / (zoom / 100),
      y: (e.clientY - rect.top - pan.y) / (zoom / 100),
    };
  };

  const isPointInElement = (point: Point, element: DrawingElement): boolean => {
    const { x, y } = point;
    const { x: ex, y: ey, width, height } = element;
    
    switch (element.type) {
      case 'rectangle':
      case 'diamond':
        return x >= ex && x <= ex + width && y >= ey && y <= ey + height;
      case 'circle':
        const centerX = ex + width / 2;
        const centerY = ey + height / 2;
        const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        return distance <= radius;
      case 'line':
      case 'arrow':
        // Simple line hit detection
        const lineDistance = Math.abs((ey + height - ey) * x - (ex + width - ex) * y + (ex + width) * ey - (ey + height) * ex) / 
                           Math.sqrt((ey + height - ey) ** 2 + (ex + width - ex) ** 2);
        return lineDistance <= 5;
      case 'text':
        return x >= ex && x <= ex + 100 && y >= ey && y <= ey + 30; // Approximate text bounds
      case 'pen':
        return element.points.some(p => Math.sqrt((x - p.x) ** 2 + (y - p.y) ** 2) <= 5);
      default:
        return false;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (toolsDisabled) return;
    const point = getMousePos(e);

    if (selectedTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (selectedTool === 'select') {
      // Find element at click point
      const clickedElement = elements.find(element => isPointInElement(point, element));
      onElementSelect(clickedElement ? clickedElement.id : null);
      return;
    }

    if (selectedTool === 'eraser') {
      // Find and remove element at click point
      const elementToRemove = elements.find(element => isPointInElement(point, element));
      if (elementToRemove) {
        if (elementToRemove.id.startsWith('temp-')) {
          // For guests, allow deletion of temp drawings without tooltip
          const newElements = elements.filter(el => el.id !== elementToRemove.id);
          onElementsChange(newElements);
          return;
        }
        const newElements = elements.filter(el => el.id !== elementToRemove.id);
        onElementsChange(newElements);
        // Only send delete event to backend if it has a real DB ID
        sendDrawingEvent({ type: 'drawing_delete', drawingId: elementToRemove.id, roomId });
      }
      return;
    }

    if (selectedTool === 'text') {
      // Create text element and start editing
      const textElement: DrawingElement = {
        id: `${Date.now()}-${Math.random()}`,
        type: 'text',
        points: [point],
        style: {
          stroke: strokeColor,
          fill: 'transparent',
          strokeWidth: strokeWidth,
          opacity: opacity,
          fontSize: fontSize,
          fontFamily: fontFamily,
          textAlign: textAlign,
        },
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        text: '',
        isEditing: true,
      };
      
      setEditingText(textElement.id);
      onCreate(textElement);
      
      // Focus text input after a short delay
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }, 100);
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const newElement: DrawingElement = {
      id: tempId,
      clientTempId: tempId,
      type: selectedTool as DrawingElement['type'],
      points: [point],
      style: {
        stroke: strokeColor,
        fill: 'transparent',
        strokeWidth: strokeWidth,
        opacity: opacity,
        fontSize: fontSize,
        fontFamily: fontFamily,
        textAlign: textAlign,
      },
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
    };

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getMousePos(e);
    setMousePos(point);
    if (isPanning && panStart) {
      onPanChange({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (!isDrawing || !startPoint || !currentElement) return;

    if (selectedTool === 'pen') {
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, point],
      });
    } else {
      setCurrentElement({
        ...currentElement,
        width: point.x - startPoint.x,
        height: point.y - startPoint.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setPanStart(null);
      return;
    }

    if (!isDrawing || !currentElement) return;

    setIsDrawing(false);
    onCreate(currentElement);
    setCurrentElement(null);
    setStartPoint(null);
  };

  const handleTextSubmit = (text: string) => {
    if (editingText) {
      const updatedElements = elements.map(el => 
        el.id === editingText 
          ? { ...el, text, isEditing: false }
          : el
      );
      onElementsChange(updatedElements);
      setEditingText(null);
    }
  };

  const getCursor = () => {
    switch (selectedTool) {
      case 'hand':
        return isPanning ? 'grabbing' : 'grab';
      case 'select':
        return 'default';
      case 'eraser':
        return 'cell';
      case 'text':
        return 'text';
      default:
        return 'crosshair';
    }
  };

  const editingElement = editingText ? elements.find(el => el.id === editingText) : null;

  return (
    <div className="fixed inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 bg-white dark:bg-gray-900"
        style={{ cursor: toolsDisabled ? 'not-allowed' : getCursor(), opacity: toolsDisabled ? 0.6 : 1 }}
        onMouseDown={handleMouseDown}
        onMouseMove={toolsDisabled ? undefined : handleMouseMove}
        onMouseUp={toolsDisabled ? undefined : handleMouseUp}
        onMouseLeave={toolsDisabled ? undefined : handleMouseUp}
        tabIndex={toolsDisabled ? -1 : 0}
        aria-disabled={toolsDisabled}
      />
      
      {selectedTool === 'eraser' && mousePos && (
        <div
          style={{
            position: 'absolute',
            left: pan.x + mousePos.x * (zoom / 100) - strokeWidth,
            top: pan.y + mousePos.y * (zoom / 100) - strokeWidth,
            width: strokeWidth * 2,
            height: strokeWidth * 2,
            borderRadius: '50%',
            border: '2px solid #6366f1',
            background: 'rgba(99,102,241,0.1)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      )}
      
      {editingElement && (
        <input
          ref={textInputRef}
          type="text"
          className="absolute bg-transparent border-none outline-none text-black"
          style={{
            left: pan.x + editingElement.x * (zoom / 100),
            top: pan.y + editingElement.y * (zoom / 100),
            fontSize: `${(editingElement.style.fontSize || 16) * (zoom / 100)}px`,
            fontFamily: editingElement.style.fontFamily || 'Inter',
            color: editingElement.style.stroke,
            textAlign: editingElement.style.textAlign || 'left',
          }}
          defaultValue={editingElement.text || ''}
          onBlur={(e) => handleTextSubmit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleTextSubmit(e.currentTarget.value);
            }
          }}
        />
      )}
      {showTempEraseTooltip && tooltipPos && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x + 10,
            top: tooltipPos.y + 10,
            background: 'rgba(31, 41, 55, 0.95)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '14px',
            zIndex: 100,
            pointerEvents: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        >
          Please wait for the drawing to sync before erasing.
        </div>
      )}
    </div>
  );
};

export default Canvas;