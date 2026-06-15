import { useState, useEffect } from "react";
import { X, Calendar, Clock, Save, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL, publicAnonKey } from "../../utils/api";

interface HolidayModeConfig {
  enabled: boolean;
  startNow: boolean;
  startDate: string;
  endDate: string;
}

interface HolidayModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HolidayModeModal({ isOpen, onClose }: HolidayModeModalProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [config, setConfig] = useState<HolidayModeConfig>({
    enabled: false,
    startNow: true,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/website-content`);
      const data = await response.json();
      
      if (data.success && data.content?.holidayMode) {
        setConfig(data.content.holidayMode);
      } else {
        // Defaults if none exist
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        setConfig({
          enabled: false,
          startNow: true,
          startDate: now.toISOString().slice(0, 16), // Format for datetime-local: YYYY-MM-DDThh:mm
          endDate: tomorrow.toISOString().slice(0, 16),
        });
      }
    } catch (error) {
      console.error("Failed to fetch holiday mode config:", error);
      toast.error("Failed to load Holiday Mode settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (config.enabled && !config.startNow && !config.startDate) {
      toast.error("Please select a start date and time");
      return;
    }
    
    if (config.enabled && !config.endDate) {
      toast.error("Please select an end date and time");
      return;
    }

    if (config.enabled && !config.startNow && new Date(config.startDate) >= new Date(config.endDate)) {
      toast.error("Start time must be before end time");
      return;
    }

    setLoading(true);
    try {
      // First get existing content so we don't overwrite it
      const response = await fetch(`${API_BASE_URL}/website-content`);
      const data = await response.json();
      const currentContent = data.success && data.content ? data.content : {};

      // Update with holiday mode
      const updatedContent = {
        ...currentContent,
        holidayMode: config,
      };

      const saveResponse = await fetch(`${API_BASE_URL}/website-content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`, // if needed
        },
        body: JSON.stringify(updatedContent),
      });

      const saveData = await saveResponse.json();
      
      if (saveData.success) {
        toast.success(config.enabled ? "Holiday Mode activated and scheduled" : "Holiday Mode disabled");
        // Dispatch custom event to notify layout/other components
        window.dispatchEvent(new Event("holiday-mode-changed"));
        onClose();
      } else {
        throw new Error(saveData.error || "Failed to save");
      }
    } catch (error) {
      console.error("Failed to save holiday mode config:", error);
      toast.error("Failed to save Holiday Mode settings");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A64BC] p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Holiday Mode Settings</h2>
              <p className="text-blue-100 text-sm">Pause payments automatically</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {fetching ? (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#0A64BC] animate-spin mb-4" />
              <p className="text-gray-500">Loading settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900">Enable Holiday Mode</h3>
                  <p className="text-sm text-gray-500">When enabled, payments will be paused and a countdown timer will be shown.</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${
                    config.enabled ? "bg-[#0A64BC]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      config.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Schedule Options (Only shown if enabled) */}
              {config.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="font-semibold text-gray-900 border-b pb-2">Schedule configuration</h3>
                  
                  {/* Start Time */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-900">
                      Start Time
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input 
                        type="checkbox" 
                        checked={config.startNow}
                        onChange={(e) => setConfig({ ...config, startNow: e.target.checked })}
                        className="rounded border-gray-300 text-[#0A64BC] focus:ring-[#0A64BC]"
                      />
                      <span className="text-sm text-gray-700 font-medium flex items-center gap-1">
                        <Play className="w-4 h-4 text-green-600" /> Start Immediately
                      </span>
                    </label>

                    {!config.startNow && (
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="datetime-local"
                          value={config.startDate}
                          onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* End Time */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      End Time (Timer target) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">The countdown timer on the user side will count down to this exact time.</p>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="datetime-local"
                        value={config.endDate}
                        onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-[#0A64BC] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || fetching}
            className="flex-1 py-2.5 rounded-xl font-semibold text-white bg-[#0A64BC] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
