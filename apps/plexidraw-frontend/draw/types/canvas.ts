export interface Point {
  x: number;
  y: number;
}

export interface DrawingElement {
  id: string;
  type: 'rectangle' | 'circle' | 'line' | 'arrow' | 'text' | 'pen' | 'diamond';
  points: Point[];
  style: {
    stroke: string;
    fill: string;
    strokeWidth: number;
    opacity: number;
    fontSize?: number;
    fontFamily?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
  text?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isEditing?: boolean;
  clientTempId?: string;
}

export interface CanvasState {
  elements: DrawingElement[];
  selectedTool: string;
  selectedElementId: string | null;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  zoom: number;
  pan: Point;
  isDragging: boolean;
  dragStart: Point | null;
}

export type Tool = 
  | 'select'
  | 'hand'
  | 'rectangle'
  | 'diamond'
  | 'circle'
  | 'arrow'
  | 'line'
  | 'pen'
  | 'text'
  | 'eraser';