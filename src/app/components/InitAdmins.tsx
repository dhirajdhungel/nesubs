import { useEffect, useState } from "react";
import { API_BASE_URL, publicAnonKey } from "../utils/api";

export function InitAdmins() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      // Check if already initialized
      const isInitialized = localStorage.getItem("dataInitialized");
      if (isInitialized) {
        setInitialized(true);
        return;
      }

      try {
        // Initialize admin accounts
        const adminsResponse = await fetch(`${API_BASE_URL}/init-admins`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });

        const adminsData = await adminsResponse.json();

        if (adminsData.success) {
          console.log("Admin accounts initialized:", adminsData.adminCount);
        }

        // Initialize dummy data
        const dummyResponse = await fetch(`${API_BASE_URL}/init-dummy-data`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
        });

        const dummyData = await dummyResponse.json();

        if (dummyData.success) {
          console.log("Dummy data initialized:", dummyData.data);
          localStorage.setItem("dataInitialized", "true");
          setInitialized(true);
        }
      } catch (error) {
        console.error("Failed to initialize data:", error);
      }
    };

    initData();
  }, []);

  return null; // This component doesn't render anything
}