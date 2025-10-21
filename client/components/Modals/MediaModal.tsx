'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  alt?: string;
}

export function MediaModal({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = 'image',
  alt = 'Media content',
}: MediaModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop - Plain background for proper media display */}
          <div className="absolute inset-0 bg-white dark:bg-black" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative z-10 max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Actions */}
            <div className="absolute top-0 right-0 z-20 flex gap-2 p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="bg-black/60 backdrop-blur-md hover:bg-black/80 text-white border border-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Media Content - No filters, original colors preserved */}
            <div className="flex items-center justify-center w-full h-full">
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] w-auto h-auto rounded-xl shadow-2xl"
                  style={{ filter: 'none', opacity: 1 }}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="relative w-full h-full flex items-center justify-center bg-white/5 dark:bg-black/20 rounded-xl p-2">
                  <Image
                    src={mediaUrl}
                    alt={alt}
                    width={1600}
                    height={1200}
                    className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
                    quality={100}
                    style={{ filter: 'none', opacity: 1 }}
                    priority
                  />
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
              <p className="text-white text-sm text-center font-medium">
                Press ESC to close or click outside
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

