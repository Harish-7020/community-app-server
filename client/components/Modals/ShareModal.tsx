'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Facebook, Twitter, Linkedin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: number;
  postContent: string;
}

export function ShareModal({ isOpen, onClose, postId, postContent }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const postUrl = typeof window !== 'undefined' ? `${window.location.origin}/post/${postId}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedText = encodeURIComponent(postContent.substring(0, 100));

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=Check out this post&body=${encodedText}%0A%0A${encodedUrl}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md"
          >
            <Card className="p-6 shadow-2xl border-border bg-card">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-bg-blue flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Share Post</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Copy Link Section */}
              <div className="mb-6">
                <label className="text-sm font-semibold mb-2 block">Post Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={postUrl}
                    readOnly
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <Button
                    onClick={handleCopyLink}
                    className={`rounded-xl transition-all ${
                      copied
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-gradient-bg-blue hover:opacity-90'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Share via</label>
                <div className="grid grid-cols-4 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('facebook')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <Facebook className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <span className="text-xs font-medium">Facebook</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('twitter')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center">
                      <Twitter className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <span className="text-xs font-medium">Twitter</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('linkedin')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                      <Linkedin className="w-6 h-6 text-white" fill="white" />
                    </div>
                    <span className="text-xs font-medium">LinkedIn</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleShare('email')}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-500/10 hover:bg-gray-500/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-500 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium">Email</span>
                  </motion.button>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

