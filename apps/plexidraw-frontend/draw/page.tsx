import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCanvas } from './hooks/useCanvas';
import Toolbar from './components/Toolbar';
import StrokePanel from './components/StrokePanel';
import ShareButton from './components/ShareButton';
import Menu from './components/Menu';
import Canvas from './components/Canvas';
import { Tool, DrawingElement, CanvasState } from './types/canvas';
import { useDrawingSocket, DrawingEvent, ChatEvent } from './hooks/useDrawingSocket';
import Link from 'next/link';
import ZoomControls from './components/ZoomControls';
import { Lock, Hand, Square, Diamond, Circle, ArrowRight, Minus, Pen, Type, Eraser, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ChatMessage {
  username: string;
  message: string;
  timestamp: number;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

export default function PlexidrawHome() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Authentication and room state
  const [storedToken, setStoredToken] = useState<string>('');
  const [roomId, setRoomId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [authLoading, setAuthLoading] = useState(true);

  const {
    canvasState,
    setCanvasState,
    history,
    historyIndex,
    canvasRef,
    undo,
    redo,
    setTool,
    setStrokeColor,
    setZoom,
    createElement,
    addToHistory,
  } = useCanvas();

  const [strokePanelOpen, setStrokePanelOpen] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  const menuRef = useRef<any>(null);
  const [showNewMsgTooltip, setShowNewMsgTooltip] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showDefaultRoomBanner, setShowDefaultRoomBanner] = useState(true);

  // Check for token on component mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('plexidraw_token');
    if (!storedToken) {
      setIsAuthenticated(false);
      setUserId('');
      setStoredToken('');
      setAuthLoading(false);
      return;
    }
    setStoredToken(storedToken);
    setIsAuthenticated(true);
    const payload = parseJwt(storedToken);
    setUserId(payload?.userId || '');
    setAuthLoading(false);
  }, [router]);

  // Set roomId from URL or default to 1
  useEffect(() => {
    const param = searchParams.get('roomId');
    if (param && !isNaN(Number(param))) {
      setRoomId(Number(param));
    } else {
      setRoomId(1); // Default room
    }
  }, [searchParams]);

  // Real-time drawing event handler
  const handleDrawingEvent = (event: DrawingEvent) => {
    if (event.type === 'drawing_create') {
      setCanvasState((prev: CanvasState) => {
        let replaced = false;
        let newElements = (prev.elements as DrawingElement[]).map(el => {
          if (event.drawing.clientTempId && el.clientTempId === event.drawing.clientTempId) {
            replaced = true;
            return event.drawing;
          }
          if (el.id === event.drawing.id) {
            replaced = true;
            return event.drawing;
          }
          return el;
      });
        if (!replaced) {
          // Only add if not already present
          if (!(newElements as DrawingElement[]).some(el => el.id === event.drawing.id)) {
            newElements = [...newElements, event.drawing];
          }
        }
        // Also update history to match
        addToHistory(newElements);
        return { ...prev, elements: newElements };
      });
    } else if (event.type === 'drawing_update') {
      setCanvasState((prev: CanvasState) => {
        const updatedElements = (prev.elements as DrawingElement[]).map((el: DrawingElement) => el.id === event.drawing.id ? event.drawing : el);
        addToHistory(updatedElements);
        return { ...prev, elements: updatedElements };
      });
    } else if (event.type === 'drawing_delete') {
      setCanvasState((prev: CanvasState) => {
        const filteredElements = (prev.elements as DrawingElement[]).filter((el: DrawingElement) => el.id !== event.drawingId);
        addToHistory(filteredElements);
        return { ...prev, elements: filteredElements };
      });
    }
  };

  // Handle chat events
  const handleChatEvent = useCallback((event: ChatEvent) => {
    setChatMessages(prev => [
      ...prev,
      {
        username: event.username || event.userId || 'Anonymous',
        message: event.message,
        timestamp: Date.now(),
      },
    ]);
    // Only show tooltip if the message is not from the current user
    if (event.userId && event.userId !== userId) {
      setShowNewMsgTooltip(true);
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = setTimeout(() => setShowNewMsgTooltip(false), 4000);
    }
  }, [userId]);

  const { sendDrawingEvent, sendChatMessage, isConnected } = useDrawingSocket({
    token: storedToken,
    roomId: roomId || 0,
    onDrawingEvent: handleDrawingEvent,
    onChatEvent: handleChatEvent
  });

  // Load initial drawings
  useEffect(() => {
    if (roomId) {
      fetch(`http://localhost:3001/drawings/${roomId}`, {
        headers: storedToken ? { Authorization: storedToken } : {},
      })
        .then(res => {
          if (res.status === 403) {
            throw new Error('You can draw, but you cannot see the drawings of authorized users. Please sign in to view all drawings.');
          }
          if (!res.ok) throw new Error('Failed to fetch drawings');
          return res.json();
        })
        .then(data => {
          if (data.drawings) {
            setCanvasState(prev => ({ ...prev, elements: data.drawings }));
            addToHistory(data.drawings);
          }
        })
        .catch(err => {
          if (
            err.message !== 'You can draw, but you cannot see the drawings of authorized users. Please sign in to view all drawings.'
          ) {
          console.error('Failed to load drawings:', err);
          }
          setError(err.message || 'Failed to load drawings');
        });
    }
  }, [roomId, storedToken]);

  useEffect(() => {
    if (roomId) {
      fetch(`http://localhost:3001/chats/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.messages) {
            setChatMessages(
              data.messages
                .reverse()
                .map((msg: { username: string; message: string; createdAt: string }) => ({
                  username: msg.username || 'Anonymous',
                  message: msg.message,
                  timestamp: new Date(msg.createdAt).getTime(),
                }))
            );
          }
        });
    }
  }, [roomId]);

  const handleElementsChange = (elements: DrawingElement[]) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, elements }));
    addToHistory(elements);
  };

  const handleCreateElement = (element: DrawingElement) => {
    const newElements = [...(canvasState.elements as DrawingElement[]), element];
    setCanvasState((prev: CanvasState) => ({ ...prev, elements: newElements }));
    addToHistory(newElements);
    if (roomId) {
      sendDrawingEvent({ type: 'drawing_create', drawing: element, roomId });
    }
  };

  const handleElementSelect = (elementId: string | null) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, selectedElementId: elementId }));
  };

  const handlePanChange = (pan: { x: number; y: number }) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, pan }));
  };

  const handleStrokeWidthChange = (width: number) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, strokeWidth: width }));
  };

  const handleOpacityChange = (opacity: number) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, opacity }));
  };

  const handleFontSizeChange = (fontSize: number) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, fontSize }));
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    setCanvasState((prev: CanvasState) => ({ ...prev, fontFamily }));
  };

  const handleTextAlignChange = (textAlign: 'left' | 'center' | 'right') => {
    setCanvasState((prev: CanvasState) => ({ ...prev, textAlign }));
  };

  // Send chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputRef.current?.value || !isConnected() || !roomId) return;

    const message = chatInputRef.current.value;
    chatInputRef.current.value = '';
    sendChatMessage(message);
  };

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    };
  }, []);

  // Inactive tools/canvas for non-authenticated users
  const toolsDisabled = !isAuthenticated;

  useEffect(() => {
    if (isAuthenticated && roomId === 1 && showDefaultRoomBanner) {
      const timer = setTimeout(() => setShowDefaultRoomBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, roomId, showDefaultRoomBanner]);

  return (
    <div className="min-h-screen bg-gray-900 overflow-hidden">
      {/* Banner for non-authenticated users */}
      {!isAuthenticated && !authLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <Card className="pointer-events-auto shadow-2xl p-2 backdrop-blur-md animate-fade-in-up border-2 border-primary/20 bg-white/80 dark:bg-zinc-900/80">
            <Alert className="mb-4 rounded-lg px-4 py-3 border bg-blue-100 dark:bg-blue-400/80 border-blue-200 dark:border-blue-800">
              <AlertTitle className="text-blue-900 dark:text-blue-100 flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 text-blue-700 dark:text-white shadow-sm">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info align-middle"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </span>
                <span className="font-bold text-blue-900 dark:text-blue-200">Welcome to PlexiDraw!</span>
              </AlertTitle>
              <AlertDescription className="text-blue-900 dark:text-blue-200">
                Sign in or create an account to save and collaborate on your drawings.
              </AlertDescription>
            </Alert>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                You need to sign in or sign up to create drawings
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/signin" tabIndex={0}>
                      <Button size="lg" className="font-semibold text-lg px-8 shadow-md cursor-pointer">
                        Sign In
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">Sign in to access your saved drawings</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/signup" tabIndex={0}>
                      <Button variant="secondary" size="lg" className="font-semibold text-lg px-8 cursor-pointer">
                        Sign Up
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="top">Create a free account</TooltipContent>
                </Tooltip>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">No credit card required • Fast & free</span>
            </CardFooter>
          </Card>
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
          {error}
        </div>
      )}
      {/* New message tooltip */}
      {showNewMsgTooltip && (
        <div className="fixed bottom-8 right-8 z-[1000]">
          <Card className="shadow-xl animate-fade-in">
            <CardContent className="flex items-center gap-4 py-4 px-6">
              <span className="text-blue-700 font-medium">New message received</span>
              <Button
                variant="outline"
                className="border-blue-700 text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  setShowNewMsgTooltip(false);
                  if (menuRef.current && typeof menuRef.current.openChatModal === 'function') {
                    menuRef.current.openChatModal();
                  }
                }}
              >
                Reply
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      <Menu 
        ref={menuRef}
        chatMessages={chatMessages}
        handleSendChat={handleSendChat}
        chatInputRef={chatInputRef}
        isConnected={isConnected}
        toolsDisabled={toolsDisabled}
      />
      {/* Desktop toolbar */}
      <div className="hidden md:block">
        <Toolbar
          selectedTool={canvasState.selectedTool as Tool}
          onToolSelect={setTool}
          zoom={canvasState.zoom}
          onZoomChange={setZoom}
          onUndo={undo}
          onRedo={redo}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
        />
        <ShareButton roomId={roomId} />
      </div>
      {/* Mobile toolbar button */}
      <button
        className="fixed bottom-4 right-4 z-30 bg-indigo-600 text-white rounded-full p-4 shadow-lg md:hidden"
        onClick={() => setMobileToolsOpen(true)}
        aria-label="Open Tools"
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
      </button>
      {/* Mobile toolbar modal */}
      {mobileToolsOpen && (
        <div className="fixed inset-0 z-40 flex items-end md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileToolsOpen(false)} />
          <div className="relative w-full bg-gray-900 rounded-t-2xl p-4 pb-8 shadow-2xl border-t border-gray-700 animate-slide-up">
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {/* Tools */}
              {[{ id: 'select', icon: <Lock size={20} />, label: 'Select' },
                { id: 'hand', icon: <Hand size={20} />, label: 'Hand' },
                { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle' },
                { id: 'diamond', icon: <Diamond size={20} />, label: 'Diamond' },
                { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
                { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
                { id: 'line', icon: <Minus size={20} />, label: 'Line' },
                { id: 'pen', icon: <Pen size={20} />, label: 'Pen' },
                { id: 'text', icon: <Type size={20} />, label: 'Text' },
                { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
              ].map(tool => (
                <button
                  key={tool.id}
                  onClick={() => { setTool(tool.id as Tool); setMobileToolsOpen(false); }}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all ${canvasState.selectedTool === tool.id ? 'bg-indigo-600 text-white' : 'text-gray-300 bg-gray-800 hover:bg-gray-700'}`}
                  title={tool.label}
                >
                  {tool.icon}
                  <span className="text-xs mt-1">{tool.label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 items-center mb-4">
              <ZoomControls
                zoom={canvasState.zoom}
                onZoomChange={setZoom}
                onUndo={undo}
                onRedo={redo}
                canUndo={historyIndex > 0}
                canRedo={historyIndex < history.length - 1}
              />
            </div>
            <div className="flex justify-center">
              <ShareButton roomId={roomId} />
            </div>
            <button
              className="mt-4 w-full py-2 rounded-lg bg-gray-700 text-white text-center"
              onClick={() => setMobileToolsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <StrokePanel
        strokeColor={canvasState.strokeColor}
        strokeWidth={canvasState.strokeWidth}
        opacity={canvasState.opacity}
        fontSize={canvasState.fontSize}
        fontFamily={canvasState.fontFamily}
        textAlign={canvasState.textAlign}
        onStrokeColorChange={setStrokeColor}
        onStrokeWidthChange={handleStrokeWidthChange}
        onOpacityChange={handleOpacityChange}
        onFontSizeChange={handleFontSizeChange}
        onFontFamilyChange={handleFontFamilyChange}
        onTextAlignChange={handleTextAlignChange}
        isOpen={strokePanelOpen}
        onToggle={() => setStrokePanelOpen(!strokePanelOpen)}
      />
      <Canvas
        elements={canvasState.elements}
        selectedTool={canvasState.selectedTool}
        selectedElementId={canvasState.selectedElementId}
        zoom={canvasState.zoom}
        pan={canvasState.pan}
        onElementsChange={isAuthenticated ? handleElementsChange : () => {}}
        onCreate={isAuthenticated ? handleCreateElement : () => {}}
        onElementSelect={isAuthenticated ? handleElementSelect : () => {}}
        onPanChange={isAuthenticated ? handlePanChange : () => {}}
        canvasRef={canvasRef}
        strokeColor={canvasState.strokeColor}
        strokeWidth={canvasState.strokeWidth}
        opacity={canvasState.opacity}
        fontSize={canvasState.fontSize}
        fontFamily={canvasState.fontFamily}
        textAlign={canvasState.textAlign}
        sendDrawingEvent={isAuthenticated ? sendDrawingEvent : () => {}}
        roomId={roomId || 1}
        toolsDisabled={toolsDisabled}
      />
      {/* Default room banner */}
      {isAuthenticated && roomId === 1 && showDefaultRoomBanner && (
        <div className="fixed top-30 left-1/2 z-40 -translate-x-1/2 w-full max-w-md px-4">
          <Alert className="flex items-center gap-3 bg-blue-100 dark:bg-blue-900/80 border-blue-200 dark:border-gray-800 shadow-md relative">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-800 text-blue-700 dark:text-white shadow-sm">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info align-middle"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </span>
            <div className="flex-1">
              <span className="font-semibold text-blue-900 dark:text-blue-100">You are in the default room (roomId=1).</span>
              <div className="text-blue-900 dark:text-blue-100 text-sm">Join or create another room to collaborate privately.</div>
            </div>
            <button
              className="absolute top-2 right-2 p-1 rounded hover:bg-blue-200 dark:hover:bg-gray-800 transition"
              onClick={() => setShowDefaultRoomBanner(false)}
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
          </Alert>
        </div>
      )}
    </div>
  );
}