import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface StrokePanelProps {
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  fontSize: number;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  onStrokeColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onOpacityChange: (opacity: number) => void;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onTextAlignChange: (align: 'left' | 'center' | 'right') => void;
  isOpen: boolean;
  onToggle: () => void;
}

const StrokePanel: React.FC<StrokePanelProps> = ({
  strokeColor,
  strokeWidth,
  opacity,
  fontSize,
  fontFamily,
  textAlign,
  onStrokeColorChange,
  onStrokeWidthChange,
  onOpacityChange,
  onFontSizeChange,
  onFontFamilyChange,
  onTextAlignChange,
  isOpen,
  onToggle,
}) => {
  const colors = [
    '#000000', '#ef4444', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#ffffff'
  ];

  const strokeWidths = [1, 2, 3, 4, 5];

  const fontSizes = [
    { label: 'S', value: 12 },
    { label: 'M', value: 16 },
    { label: 'L', value: 20 },
    { label: 'XL', value: 24 },
  ];

  const textAlignOptions = [
    { label: '⬅', value: 'left' as const },
    { label: '↔', value: 'center' as const },
    { label: '➡', value: 'right' as const },
  ];

  return (
    <div className="fixed left-4 top-20 z-10">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 w-64">
        <button
          onClick={onToggle}
          className="w-full p-3 flex items-center justify-between text-white hover:bg-gray-700 rounded-t-lg transition-colors duration-200"
        >
          <span className="font-medium">Stroke</span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isOpen && (
          <div className="p-4 space-y-4">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Colors</label>
              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => onStrokeColorChange(color)}
                    className={`w-8 h-8 rounded border-2 transition-all duration-200 ${
                      strokeColor === color
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Stroke width</label>
              <div className="flex gap-2">
                {strokeWidths.map((width) => (
                  <button
                    key={width}
                    onClick={() => onStrokeWidthChange(width)}
                    className={`px-3 py-2 rounded text-sm transition-colors duration-200 ${
                      strokeWidth === width
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {width}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Font family</label>
              <div className="flex gap-2">
                {['Inter', 'Mono', 'Serif'].map((family) => (
                  <button
                    key={family}
                    onClick={() => onFontFamilyChange(family)}
                    className={`px-3 py-2 rounded text-sm transition-colors duration-200 ${
                      fontFamily === family
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {family === 'Inter' ? 'Aa' : family === 'Mono' ? '</>' : 'A'}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Font size</label>
              <div className="flex gap-2">
                {fontSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => onFontSizeChange(size.value)}
                    className={`px-3 py-2 rounded text-sm transition-colors duration-200 ${
                      fontSize === size.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Align */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Text align</label>
              <div className="flex gap-2">
                {textAlignOptions.map((align) => (
                  <button
                    key={align.value}
                    onClick={() => onTextAlignChange(align.value)}
                    className={`px-3 py-2 rounded text-sm transition-colors duration-200 ${
                      textAlign === align.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {align.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Opacity</label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-6">0</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={opacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <span className="text-sm text-gray-400 w-8">100</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrokePanel;