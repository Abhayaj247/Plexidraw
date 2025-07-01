import React from 'react';
import { 
  Lock, 
  Hand, 
  Square, 
  Diamond, 
  Circle, 
  ArrowRight, 
  Minus, 
  Pen, 
  Type, 
  Eraser
} from 'lucide-react';
import { Tool } from '../types/canvas';
import ZoomControls from './ZoomControls';

interface ToolbarProps {
  selectedTool: Tool;
  onToolSelect: (tool: Tool) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  selectedTool, 
  onToolSelect,
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const tools = [
    { id: 'select', icon: Lock, label: 'Select' },
    { id: 'hand', icon: Hand, label: 'Hand' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'diamond', icon: Diamond, label: 'Diamond' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
  ];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-start gap-4">
      <div className="bg-gray-800 rounded-lg p-2 flex items-center gap-1 shadow-lg border border-gray-700">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id as Tool)}
              className={`p-2 rounded-md transition-all duration-200 group relative ${
                selectedTool === tool.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              title={tool.label}
            >
              <Icon size={20} />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                {tool.label}
              </div>
            </button>
          );
        })}
      </div>

      <ZoomControls 
        zoom={zoom}
        onZoomChange={onZoomChange}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div className="absolute top-full text-center mt-2 text-sm text-gray-400 w-full whitespace-nowrap">
        To move canvas, hold mouse wheel or spacebar while dragging, or use the hand tool
      </div>
    </div>
  );
};

export default Toolbar;