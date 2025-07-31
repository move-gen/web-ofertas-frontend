"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

export const useTransitionNavigation = () => {
  const router = useRouter();

  const navigateWithTransition = useCallback((href: string) => {
    // Trigger transition animation
    const event = new CustomEvent('startTransition', { detail: { href } });
    window.dispatchEvent(event);
    
    // The actual navigation will be handled by the TransitionProvider
  }, []);

  return { navigateWithTransition };
}; 