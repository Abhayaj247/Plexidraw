import { useState, useRef, useCallback } from 'react';
import { DrawingElement, CanvasState, Point, Tool } from '../types/canvas';

export const useCanvas = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    selectedTool: 'select',
    selectedElementId: null,
    strokeColor: '#000000',
    fillColor: 'transparent',
    strokeWidth: 2,
    opacity: 100,
    fontSize: 16,
    fontFamily: 'Inter',
    textAlign: 'left',
    zoom: 100,
    pan: { x: 0, y: 0 },
    isDragging: false,
    dragStart: null,
  });

  const [history, setHistory] = useState<DrawingElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawingElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addToHistory = useCallback((elements: DrawingElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCanvasState(prev => ({
        ...prev,
        elements: history[newIndex]
      }));
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCanvasState(prev => ({
        ...prev,
        elements: history[newIndex]
      }));
    }
  }, [historyIndex, history]);

  const setTool = useCallback((tool: Tool) => {
    setCanvasState(prev => ({ ...prev, selectedTool: tool, selectedElementId: null }));
  }, []);

  const setStrokeColor = useCallback((color: string) => {
    setCanvasState(prev => ({ ...prev, strokeColor: color }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setCanvasState(prev => ({ ...prev, zoom: Math.max(10, Math.min(500, zoom)) }));
  }, []);

  const createElement = useCallback((
    type: DrawingElement['type'],
    x: number,
    y: number,
    width: number = 0,
    height: number = 0
  ): DrawingElement => {
    return {
      id: `${Date.now()}-${Math.random()}`,
      type,
      points: [{ x, y }],
      style: {
        stroke: canvasState.strokeColor,
        fill: canvasState.fillColor,
        strokeWidth: canvasState.strokeWidth,
        opacity: canvasState.opacity,
        fontSize: canvasState.fontSize,
        fontFamily: canvasState.fontFamily,
        textAlign: canvasState.textAlign,
      },
      x,
      y,
      width,
      height,
    };
  }, [canvasState]);

  return {
    canvasState,
    setCanvasState,
    history,
    historyIndex,
    isDrawing,
    setIsDrawing,
    currentElement,
    setCurrentElement,
    canvasRef,
    addToHistory,
    undo,
    redo,
    setTool,
    setStrokeColor,
    setZoom,
    createElement,
  };
};