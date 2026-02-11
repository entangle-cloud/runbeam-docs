import React, { useEffect, useRef } from 'react';
import AISearchButton from '@site/src/components/AISearchComponent/AISearchButton';

export default function Root({ children }: { children: React.ReactNode }) {
  const rootsRef = useRef<Map<HTMLElement, any>>(new Map());

  useEffect(() => {
    const mountButton = (navbarRight: Element) => {
      // Check if button already exists in this navbar
      const existingContainer = navbarRight.querySelector('.ai-search-container');
      if (existingContainer) {
        return;
      }

      // Create a container for our button
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'navbar__item ai-search-container';
      buttonContainer.style.display = 'flex';
      buttonContainer.style.alignItems = 'center';
      
      // Insert before the color mode toggle
      const colorModeToggle = navbarRight.querySelector('[class*="colorModeToggle"]');
      if (colorModeToggle) {
        navbarRight.insertBefore(buttonContainer, colorModeToggle);
      } else {
        navbarRight.appendChild(buttonContainer);
      }

      // Render the AI Search Button
      const handleSearchClick = () => {
        const event = new CustomEvent('toggle-entangle-model');
        window.dispatchEvent(event);
      };

      // Mount React component
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(buttonContainer);
        rootsRef.current.set(buttonContainer, root);
        root.render(<AISearchButton onClick={handleSearchClick} />);
      });
    };

    // Try to find navbar immediately
    const navbarRight = document.querySelector('.navbar__items--right');
    if (navbarRight) {
      mountButton(navbarRight);
    }

    // Set up MutationObserver to watch for navbar changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Check if the added node contains the navbar
            const navbarRight = element.querySelector?.('.navbar__items--right') || 
                               (element.classList?.contains('navbar__items--right') ? element : null);
            if (navbarRight) {
              mountButton(navbarRight);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Add keyboard shortcut listener for Ctrl+K / Cmd+K
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        const customEvent = new CustomEvent('toggle-entangle-model');
        window.dispatchEvent(customEvent);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
      // Unmount all roots
      rootsRef.current.forEach((root) => {
        root.unmount();
      });
      rootsRef.current.clear();
    };
  }, []);

  return <>{children}</>;
}
