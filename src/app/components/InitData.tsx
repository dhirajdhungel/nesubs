import { useEffect, useState } from 'react';
import { API_BASE_URL, publicAnonKey } from '../utils/api';

export function InitData() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initializeData() {
      try {
        // Check if already initialized in this session
        const hasInitialized = sessionStorage.getItem('nesubs_data_initialized');
        
        if (hasInitialized) {
          setInitialized(true);
          return;
        }

        console.log('Initializing Nesubs data...');

        // Initialize storage bucket for category icons
        await fetch(`${API_BASE_URL}/init-storage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        // Initialize dummy data (categories, products, users, orders)
        await fetch(`${API_BASE_URL}/init-dummy-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        });

        // Mark as initialized for this session
        sessionStorage.setItem('nesubs_data_initialized', 'true');
        setInitialized(true);
        
        console.log('Nesubs data initialized successfully!');
      } catch (error) {
        console.error('Error initializing data:', error);
        // Still mark as initialized to avoid blocking the app
        setInitialized(true);
      }
    }

    initializeData();
  }, []);

  // This component doesn't render anything
  return null;
}
