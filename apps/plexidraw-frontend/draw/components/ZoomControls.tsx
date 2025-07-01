import React from 'react';
import { Minus, Plus, RotateCcw, RotateCw } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const handleZoomOut = () => {
    onZoomChange(zoom - 10);
  };

  const handleZoomIn = () => {
    onZoomChange(zoom + 10);
  };

  const handleZoomReset = () => {
    onZoomChange(100);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-1 flex items-center gap-1 shadow-lg border border-gray-700">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`p-2 rounded transition-colors duration-200 ${
          canUndo
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        title="Undo"
      >
        <RotateCcw size={18} />
      </button>
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`p-2 rounded transition-colors duration-200 ${
          canRedo
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 cursor-not-allowed'
        }`}
        title="Redo"
      >
        <RotateCw size={18} />
      </button>

      <div className="w-px bg-gray-600 h-6 mx-1" />

      <button
        onClick={handleZoomOut}
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
        title="Zoom Out"
      >
        <Minus size={18} />
      </button>
      <button
        onClick={handleZoomReset}
        className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200 min-w-[60px] text-sm font-medium"
        title="Reset Zoom"
      >
        {zoom}%
      </button>
      <button
        onClick={handleZoomIn}
        className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
        title="Zoom In"
      >
        <Plus size={18} />
      </button>
    </div>
  );
};

export default ZoomControls;