import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';

interface ShareButtonProps {
  roomId?: number | null;
}

const ShareButton: React.FC<ShareButtonProps> = ({ roomId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    let url = window.location.href;
    if (roomId) {
      url = `${window.location.origin}/draw?roomId=${roomId}`;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
      >
        <Share2 size={18} />
        Share
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-gray-800 rounded-lg shadow-lg border border-gray-700 p-4 w-64">
          <h3 className="text-white font-medium mb-3">Share this canvas</h3>
          <div className="space-y-2">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors duration-200"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <div className="text-xs text-gray-400 break-all mt-2">
              {roomId ? `${window.location.origin}/draw?roomId=${roomId}` : window.location.href}
            </div>
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;