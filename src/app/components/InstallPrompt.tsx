import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed, don't show prompt
    }

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('installPromptDismissed');
    if (dismissed) {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after 30 seconds on homepage
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#0A64BC] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A64BC] to-[#084d92] p-4 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0A64BC]">N</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">Install Nesubs</h3>
                <p className="text-xs text-blue-100">Get the app experience</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <ul className="space-y-2 mb-4 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Install like a native app
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Access from home screen
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">•</span>
              Faster loading & offline support
            </li>
          </ul>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-[#0A64BC] text-white py-3 rounded-xl font-bold hover:bg-[#084d92] transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
