import { useEffect } from 'react';
import { DefaultLoadingManager } from 'three';

export function useLoadingManager(onError: (url: string) => void) {
  useEffect(() => {
    DefaultLoadingManager.onError = (url) => {
      console.error(`Error loading texture: ${url}`);
      onError(url);
    };

    DefaultLoadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      console.log(`Loading file: ${url}. ${itemsLoaded}/${itemsTotal} files loaded`);
    };

    return () => {
      DefaultLoadingManager.onError = () => {};
      DefaultLoadingManager.onProgress = () => {};
    };
  }, [onError]);
} 