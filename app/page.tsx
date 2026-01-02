'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Flower } from '@/types/flower';
import { FLOWER_METADATA } from '@/lib/flower-data';
import CloudsAnimation from '@/components/clouds-animation';
import { MusicPlayer } from '@/components/music-player';
import { DirtPlot } from '@/components/dirt-plot';
import { PlantingDrawer } from '@/components/planting-drawer';
import { FlowerDetailModal } from '@/components/flower-detail-modal';
import { InfoModal } from '@/components/info-modal';

type UserState = 'normal' | 'viewing' | 'planting';

export default function GardenPage() {
  // State machine
  const [userState, setUserState] = useState<UserState>('normal');

  // Scroll state
  const [offset, setOffset] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const [preZoomOffset, setPreZoomOffset] = useState(0); // Store offset before zooming
  
  // Touch/drag state for mobile
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, offset: 0 });
  const touchStartRef = useRef<{ x: number; y: number; offset: number } | null>(null);

  // Flower state
  const [allFlowers, setAllFlowers] = useState<Flower[]>([]);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);
  const [plantingPosition, setPlantingPosition] = useState<{ x: number; y: number } | null>(null);
  const [newlyPlantedFlowerId, setNewlyPlantedFlowerId] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sun blink state
  const [sunImage, setSunImage] = useState('/sun.png');
  const sunHoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sunBlinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isSunHovered, setIsSunHovered] = useState(false);
  
  // Sky area detection - top ~33% is sky (not plantable)
  const getSkyAreaHeight = useCallback(() => {
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    return viewportHeight * 0.28; // Top 33% is sky
  }, []);

  // Clear scroll when entering viewing or planting states
  useEffect(() => {
    if (userState !== 'normal') {
      setScrollSpeed(0);
    }
  }, [userState]);

  // Auto-scroll based on cursor position (edge scrolling)
  useEffect(() => {
    if (userState !== 'normal' || scrollSpeed === 0) return;

    let animationFrame: number;
    const scroll = () => {
      setOffset(prev => prev + scrollSpeed);
      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrame);
  }, [scrollSpeed, userState]);

  // Load all flowers on mount
  useEffect(() => {
    setIsLoading(true);
    fetch('/api/flowers')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load flowers');
        return res.json();
      })
      .then(data => {
        setAllFlowers(data || []);
        setError(null);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load garden. Please refresh.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Handle shared flower from URL
  useEffect(() => {
    if (isLoading) return;

    const pathSegments = window.location.pathname.split('/');
    if (pathSegments[1] === 'flower' && pathSegments[2]) {
      const slug = pathSegments[2];

      fetch(`/api/flowers/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('Flower not found');
          return res.json();
        })
        .then(flower => {
          setAllFlowers(prev => {
            const exists = prev.some(f => f.id === flower.id);
            return exists ? prev : [...prev, flower];
          });

          handleFlowerClick(flower);
        })
        .catch(err => {
          console.error(err);
          setError('Shared flower not found');
        });
    }
  }, [isLoading]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const pathSegments = window.location.pathname.split('/');

      if (pathSegments[1] === 'flower' && pathSegments[2]) {
        // User navigated to a flower URL
        const slug = pathSegments[2];
        const flower = allFlowers.find(f => f.slug === slug);

        if (flower) {
          setPreZoomOffset(offset);
          setSelectedFlower(flower);
          setUserState('viewing');
        }
      } else {
        // User navigated back to home
        if (userState === 'viewing') {
          setOffset(preZoomOffset);
          setUserState('normal');
          setSelectedFlower(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [allFlowers, offset, userState, preZoomOffset]);


  // Viewport culling - account for garden container scrolling
  const visibleFlowers = useMemo(() => {
    // Show all flowers when viewing or planting (we'll handle their visibility individually)
    if (userState === 'viewing' || userState === 'planting') {
      return allFlowers;
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const buffer = 300;
    const flowerHalfWidth = 60; // Half of max flower width (115px / 2 ≈ 60px)
    const leftPadding = 60; // Container padding

    return allFlowers.filter(flower => {
      // Garden scrolls with translateX(-offset), so flowers appear at: flower.x - offset + leftPadding
      const minX = 60;
      const adjustedX = Math.max(flower.x, minX);
      const screenX = adjustedX - offset + leftPadding; // Negative offset because container scrolls left
      // Account for flower width - ensure the flower is at least partially visible
      return screenX > -buffer - flowerHalfWidth && screenX < viewportWidth + buffer + flowerHalfWidth;
    });
  }, [offset, allFlowers, userState, selectedFlower]);

  // Handlers
  const handleFlowerClick = useCallback((flower: Flower) => {
    // Store current offset before zooming
    setPreZoomOffset(offset);
    setSelectedFlower(flower);
    setUserState('viewing');
    // Update URL with flower slug for sharing
    window.history.pushState({}, '', `/flower/${flower.slug}`);
  }, [offset]);

  const handleExitViewing = useCallback(() => {
    // Restore previous offset when exiting zoom
    setOffset(preZoomOffset);
    setUserState('normal');
    setSelectedFlower(null);
    // Return to home URL
    window.history.pushState({}, '', '/');
  }, [preZoomOffset]);

  const handleGrassClick = useCallback((e: React.MouseEvent) => {
    if (userState === 'viewing') {
      handleExitViewing();
      return;
    }

    if (userState === 'planting') {
      return;
    }

    // Store current offset before zooming for planting
    setPreZoomOffset(offset);

    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const clickX = e.clientX - rect.left;
    const leftPadding = 60; // Match the padding added to the container
    const skyHeight = getSkyAreaHeight();

    // Check if click is in sky area (top ~33%) - don't allow planting there
    if (clickY < skyHeight) {
      return; // Clicked in sky area, don't plant
    }

    // Calculate absolute position accounting for current scroll offset
    const absoluteX = clickX - leftPadding + offset;
    const absoluteY = clickY;

    // Check if click is too close to existing flowers (restricted area)
    const minDistance = 100; // Minimum distance from existing flowers in pixels
    const isTooClose = allFlowers.some(flower => {
      const minX = 60;
      const adjustedX = Math.max(flower.x, minX);
      const distance = Math.sqrt(
        Math.pow(absoluteX - adjustedX, 2) + Math.pow(absoluteY - flower.y, 2)
      );
      return distance < minDistance;
    });

    if (isTooClose) {
      return; // Too close to existing flower, don't plant
    }

    if (clickY >= 0 && clickY <= rect.height) {
      setPlantingPosition({ x: absoluteX, y: absoluteY });
      setUserState('planting');
    }
  }, [userState, offset, handleExitViewing, getSkyAreaHeight, allFlowers]);

  const handleExitPlanting = useCallback(() => {
    // Restore previous offset when exiting planting
    setOffset(preZoomOffset);
    setUserState('normal');
    setPlantingPosition(null);
  }, [preZoomOffset]);

  // Handle mouse movement for edge scrolling
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (userState !== 'normal') {
      setScrollSpeed(0);
      return;
    }

    const edgeThreshold = 200; // pixels from edge to start scrolling (increased from 150)
    const maxSpeed = 8; // Maximum scroll speed
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;

    const distanceFromLeft = e.clientX;
    const distanceFromRight = viewportWidth - e.clientX;

    if (distanceFromLeft < edgeThreshold) {
      // Scroll right (positive offset)
      const intensity = 1 - (distanceFromLeft / edgeThreshold);
      setScrollSpeed(maxSpeed * intensity);
    } else if (distanceFromRight < edgeThreshold) {
      // Scroll left (negative offset)
      const intensity = 1 - (distanceFromRight / edgeThreshold);
      setScrollSpeed(-maxSpeed * intensity);
    } else {
      setScrollSpeed(0);
    }
  }, [userState]);

  const handleMouseLeave = useCallback(() => {
    setScrollSpeed(0);
  }, []);

  // Touch handlers for mobile panning - scrolls the garden container
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (userState !== 'normal') return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      offset: offset
    };
    setIsDragging(true);
  }, [userState, offset]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || userState !== 'normal') return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    
    // Prevent default to allow smooth panning (only if horizontal movement)
    if (Math.abs(deltaX) > 5) {
      e.preventDefault();
    }
    
    // Update horizontal offset - invert direction so drag right scrolls right
    // Drag right (positive deltaX) = scroll right = decrease offset (container moves right)
    // Drag left (negative deltaX) = scroll left = increase offset (container moves left)
    const newOffset = touchStartRef.current.offset - deltaX;
    setOffset(Math.max(0, newOffset)); // Prevent negative scrolling
  }, [userState]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) {
      touchStartRef.current = null;
      setIsDragging(false);
      return;
    }
    
    // Check if this was a tap (not a drag)
    const touch = e.changedTouches[0];
    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    const wasTap = deltaX < 10 && deltaY < 10;
    
    // Check if tap was on a flower element - if so, don't trigger grass click
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const isFlowerClick = target?.closest('.flower-clickable');
    
    // If it was a tap and not on a flower, trigger grass click
    if (wasTap && userState === 'normal' && !isFlowerClick) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const clickY = touch.clientY - rect.top;
      const clickX = touch.clientX - rect.left;
      const leftPadding = 60;
      const skyHeight = getSkyAreaHeight();
      
      // Check if tap is in sky area - don't allow planting there
      if (clickY < skyHeight) {
        touchStartRef.current = null;
        setIsDragging(false);
        return;
      }
      
      // Calculate absolute position accounting for current scroll offset
      const absoluteX = clickX - leftPadding + offset;
      const absoluteY = clickY;

      // Check if click is too close to existing flowers (restricted area)
      const minDistance = 100; // Minimum distance from existing flowers in pixels
      const isTooClose = allFlowers.some(flower => {
        const minX = 60;
        const adjustedX = Math.max(flower.x, minX);
        const distance = Math.sqrt(
          Math.pow(absoluteX - adjustedX, 2) + Math.pow(absoluteY - flower.y, 2)
        );
        return distance < minDistance;
      });

      if (isTooClose) {
        touchStartRef.current = null;
        setIsDragging(false);
        return; // Too close to existing flower, don't plant
      }
      
      if (clickY >= 0 && clickY <= rect.height) {
        setPreZoomOffset(offset);
        setPlantingPosition({ x: absoluteX, y: absoluteY });
        setUserState('planting');
      }
    }
    
    touchStartRef.current = null;
    setIsDragging(false);
  }, [userState, offset, getSkyAreaHeight, allFlowers]);

  const handlePlantSuccess = useCallback((flower: Flower) => {
    setAllFlowers(prev => [...prev, flower]);
    // Mark this flower as newly planted
    setNewlyPlantedFlowerId(flower.id);
    // Remove the glow after 12.5 seconds (2.5s animation × 5 iterations)
    setTimeout(() => {
      setNewlyPlantedFlowerId(null);
    }, 12500);
    // Restore offset and exit planting state
    setOffset(preZoomOffset);
    setUserState('normal');
    setPlantingPosition(null);
  }, [preZoomOffset]);

  // Sun blink function
  const triggerSunBlink = useCallback(() => {
    setSunImage('/sun_blink.png');
    setTimeout(() => {
      setSunImage('/sun.png');
    }, 200); // Blink duration: 200ms
  }, []);

  // Sun hover handlers
  const handleSunMouseEnter = useCallback(() => {
    setIsSunHovered(true);
    // Start timer for 2 seconds before first blink
    sunHoverTimerRef.current = setTimeout(() => {
      triggerSunBlink();
      // Continue blinking every 3 seconds while hovered
      sunBlinkIntervalRef.current = setInterval(() => {
        triggerSunBlink();
      }, 3000);
    }, 2000);
  }, [triggerSunBlink]);

  const handleSunMouseLeave = useCallback(() => {
    setIsSunHovered(false);
    // Clear initial timer
    if (sunHoverTimerRef.current) {
      clearTimeout(sunHoverTimerRef.current);
      sunHoverTimerRef.current = null;
    }
    // Clear ongoing blink interval
    if (sunBlinkIntervalRef.current) {
      clearInterval(sunBlinkIntervalRef.current);
      sunBlinkIntervalRef.current = null;
    }
  }, []);

  const handleSunClick = useCallback(() => {
    triggerSunBlink();
  }, [triggerSunBlink]);


  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-blue-50">
        <div className="animate-spin">
          <Image
            src="/special_flower.png"
            alt="Loading"
            width={150}
            height={150}
            className="w-[150px] h-[150px] object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Pannable Garden Container - Full height with background, flowers, sun and clouds */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ touchAction: 'pan-y pan-x' }}
      >
        {/* Scrolling Garden Background and Content */}
        <div
          className="relative h-full"
          style={{ 
            paddingLeft: '60px',
            width: '500%', // Wide enough for horizontal scrolling
            minWidth: '5000px',
            touchAction: 'none', // Prevent default touch actions, we handle it manually
            transform: `translateX(${-offset}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            const skyHeight = getSkyAreaHeight();
            // Change cursor based on whether in sky or grass area
            if (mouseY < skyHeight) {
              e.currentTarget.style.cursor = 'pointer';
            } else {
              e.currentTarget.style.cursor = 'url(/shovel-cursor.png) 16 16, pointer';
            }
          }}
          onClick={handleGrassClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Garden Background Image - scrolls with container, repeats horizontally, fixed vertically to keep sky visible */}
          <div 
            className="absolute inset-0 z-0" 
            style={{ 
              width: '500%', 
              minWidth: '5000px',
              height: '100%', // Match viewport height - sky stays at top
              backgroundImage: 'url(/background.png)',
              backgroundRepeat: 'repeat-x', // Only repeat horizontally
              backgroundPosition: 'top center',
              backgroundSize: 'auto 100%'
            }}
          />

          {/* Dirt Plot Preview */}
            {plantingPosition && userState === 'planting' && (
              <DirtPlot
                x={plantingPosition.x + 60} // Add padding to account for container padding
                y={plantingPosition.y}
                visible={true}
              />
            )}

            {/* Flowers */}
            {visibleFlowers.map((flower) => {
              const isThisFlowerSelected = selectedFlower?.id === flower.id;
              const isOtherFlowerSelected = selectedFlower !== null && !isThisFlowerSelected;
              const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
              const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

              const isZoomed = userState === 'viewing' || userState === 'planting';

              // Calculate flower position
              const getFlowerStyle = () => {
                // Skip selected flower - it's rendered outside the container
                if (userState === 'viewing' && isThisFlowerSelected) {
                  return {
                    opacity: 0,
                    pointerEvents: 'none' as const,
                  };
                } else if (userState === 'viewing' && isOtherFlowerSelected) {
                  // Hide other flowers - flowers stay in fixed positions
                  const minX = 60;
                  const adjustedX = Math.max(flower.x, minX);
                  return {
                    left: `${adjustedX}px`,
                    top: `${flower.y}px`,
                    opacity: 0,
                    transform: 'scale(0.5)',
                    zIndex: 10,
                  };
                }
                // Normal position - flowers stay in fixed positions, garden scrolls
                // Ensure minimum x position to prevent flowers from being cut off
                const minX = 60; // Minimum x to keep flower fully visible
                const adjustedX = Math.max(flower.x, minX);
                
                return {
                  left: `${adjustedX}px`, // Fixed position, no offset - garden scrolls instead
                  top: `${flower.y}px`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                };
              };

              const flowerStyle = getFlowerStyle();
              const { zIndex, ...restStyle } = flowerStyle;

              return (
                <div
                  key={flower.id}
                  className="absolute group transition-all duration-700 ease-in-out flower-clickable hover:!z-[100]"
                  style={{ ...restStyle, zIndex }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleFlowerClick(flower);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation(); // Prevent grass click from firing
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleFlowerClick(flower);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFlowerClick(flower);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${flower.title}`}
                >
                  {/* Expanded clickable area */}
                  <div className="absolute -inset-4 z-0" />

                  <Image
                    src={FLOWER_METADATA[flower.flower].image}
                    alt={flower.title}
                    width={flower.flower === 'blue-forget-me-not' || flower.flower === 'white-rose' ? 115 : 100}
                    height={flower.flower === 'blue-forget-me-not' || flower.flower === 'white-rose' ? 115 : 100}
                    className={`relative z-[1] transition ${!isZoomed ? 'hover:scale-110 animate-sway flower-hover-glow' : ''} ${
                      newlyPlantedFlowerId === flower.id
                        ? 'animate-new-flower'
                        : (isThisFlowerSelected && userState === 'viewing')
                          ? 'animate-viewing-flower'
                          : ''
                    }`}
                    style={{
                      animationDelay: !isZoomed ? `${(flower.x % 20) * 0.1}s` : '0s'
                    }}
                  />

                  {/* Hover Preview Tooltip */}
                  {userState === 'normal' && !isOtherFlowerSelected && (() => {
                    // Get tooltip colors based on flower type
                    const getTooltipColors = () => {
                      switch (flower.flower) {
                        case 'red-tulip':
                          return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-900', arrow: 'border-t-red-50' };
                        case 'white-rose':
                          return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', arrow: 'border-t-gray-50' };
                        case 'yellow-sunflower':
                          return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-900', arrow: 'border-t-yellow-50' };
                        case 'pink-carnation':
                          return { bg: 'bg-pink-50', border: 'border-pink-300', text: 'text-pink-900', arrow: 'border-t-pink-50' };
                        case 'blue-forget-me-not':
                          return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-900', arrow: 'border-t-blue-50' };
                        case 'orange-lily':
                          return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-900', arrow: 'border-t-orange-50' };
                        default:
                          return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-900', arrow: 'border-t-gray-50' };
                      }
                    };

                    const colors = getTooltipColors();
                    // Truncate title if longer than 40 characters
                    const displayTitle = flower.title.length > 40
                      ? flower.title.slice(0, 40) + '...'
                      : flower.title;

                    return (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[20]">
                        <div className={`${colors.bg} ${colors.text} text-sm px-5 py-3 rounded-lg min-w-[150px] max-w-[350px] text-center shadow-lg border-2 ${colors.border}`}>
                          <p className="font-semibold text-base">{displayTitle}</p>
                          {flower.author && (
                            <p className="text-xs mt-1 opacity-75">by {flower.author}</p>
                          )}
                        </div>
                        <div className={`w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${colors.arrow} mx-auto`}></div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
        </div>
      </div>

      {/* Selected Flower - Rendered outside scrolling container when viewing */}
      {userState === 'viewing' && selectedFlower && (() => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
        const isMobile = viewportWidth < 640;
        const flower = selectedFlower;
        
        return (
          <div
            key={flower.id}
            className="fixed pointer-events-none"
            style={{
              left: '50%',
              top: isMobile ? '20%' : '50%', // Top on mobile, center on desktop
              transform: `translate(-50%, -50%) scale(${isMobile ? '1' : '3'})`, // Smaller on mobile
              zIndex: 50,
            }}
          >
            <Image
              src={FLOWER_METADATA[flower.flower].image}
              alt={flower.title}
              width={flower.flower === 'blue-forget-me-not' || flower.flower === 'white-rose' ? 115 : 100}
              height={flower.flower === 'blue-forget-me-not' || flower.flower === 'white-rose' ? 115 : 100}
              className="relative z-[1] animate-viewing-flower"
            />
          </div>
        );
      })()}

      {/* Clouds Layer - Fixed on top of garden background, doesn't scroll */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <CloudsAnimation gardenOffset={0} />
      </div>

      {/* Sun - Fixed on top of garden background, doesn't scroll */}
      <div
        className="fixed top-2 left-2 sm:top-8 sm:left-16 z-[15] cursor-pointer"
        onMouseEnter={handleSunMouseEnter}
        onMouseLeave={handleSunMouseLeave}
        onClick={handleSunClick}
      >
        <Image
          src={sunImage}
          alt="Sun"
          width={200}
          height={200}
          className="w-16 h-16 sm:w-[120px] sm:h-[120px] md:w-[200px] md:h-[200px]"
          priority
        />
      </div>

      {/* Music Player */}
      <MusicPlayer />

      {/* Error Display */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      {/* Drawers & Modals */}
      <PlantingDrawer
        isOpen={userState === 'planting'}
        onClose={handleExitPlanting}
        clickPosition={plantingPosition}
        currentOffset={offset}
        onPlantSuccess={handlePlantSuccess}
      />

      <FlowerDetailModal
        flower={selectedFlower}
        isOpen={userState === 'viewing'}
        onClose={handleExitViewing}
      />

      {/* Info Modal */}
      <InfoModal />
    </div>
  );
}
