import React from 'react';
import styles from './AISearchButton.module.css';

interface AISearchButtonProps {
  onClick?: () => void;
}

const AISearchButton: React.FC<AISearchButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={styles.aiSearchButton}
      aria-label="AI-powered search"
      type="button"
    >
      <div className={styles.searchIconContainer}>
        <svg
          className={styles.searchIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className={styles.aiSparkle}>✨</span>
      </div>
      <span className={styles.searchLabel}>AI Search</span>
      <kbd className={styles.searchShortcut}>⌘K</kbd>
    </button>
  );
};

export default AISearchButton;