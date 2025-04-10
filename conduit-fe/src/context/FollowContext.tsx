import React, { createContext, useContext, useState, useEffect } from 'react';

// Define FollowContextType
interface FollowContextType {
  following: Record<string, boolean>;
  setFollowing: (username: string, following: boolean) => void;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

// FollowProvider component to provide the context
export const FollowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [following, setFollowingState] = useState<Record<string, boolean>>({});

  // Load the following data from localStorage when the component mounts
  useEffect(() => {
    const savedFollowing = localStorage.getItem("followingData");
    if (savedFollowing) {
      setFollowingState(JSON.parse(savedFollowing)); // Set state from localStorage
    }
  }, []);

  // setFollowing function to update follow status and persist it in localStorage
  const setFollowing = (username: string, following: boolean) => {
    // Only update if the follow status has changed to avoid unnecessary re-renders
    setFollowingState((prevFollowing) => {
      // Check if the current follow status is different from the new status
      if (prevFollowing[username] !== following) {
        const updatedFollowing = { ...prevFollowing, [username]: following };
        localStorage.setItem("followingData", JSON.stringify(updatedFollowing)); // Store updated state in localStorage
        return updatedFollowing;
      }
      return prevFollowing; // No change, return the previous state
    });
  };

  return (
    <FollowContext.Provider value={{ following, setFollowing }}>
      {children}
    </FollowContext.Provider>
  );
};

// Hook to use FollowContext in components
export const useFollow = (): FollowContextType => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollow must be used within a FollowProvider");
  }
  return context;
};
