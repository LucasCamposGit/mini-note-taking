/**
 * Utility functions and constants
 */

/**
 * Constants for the application
 */
export const CONSTANTS = {
    MAX_TWEET_LENGTH: 280,
    WARNING_THRESHOLD: 260
  };
  
  /**
   * Formats a date string to a Twitter-like relative time format
   * @param {string} dateString - ISO date string to format
   * @returns {string} Formatted relative time string (e.g., "2s", "5m", "2h", "3d", "Jan 15")
   */
  export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
  
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)}d`;
    } else {
      const options = { month: 'short', day: 'numeric' };
      if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
      }
      return date.toLocaleDateString(undefined, options);
    }
  }
  
  /**
   * Updates character counter display and styling based on input length
   * @param {HTMLElement} counterElement - The DOM element displaying the character count
   * @param {number} length - Current length of the input text
   * @param {number} maxLength - Maximum allowed length
   * @param {HTMLElement} postButton - Button to enable/disable based on input validity
   */
  export function updateCharacterCounter(counterElement, length, maxLength, postButton) {
    // Update counter text
    counterElement.textContent = `${length} / ${maxLength}`;
  
    // Enable/disable post button based on content
    if (length > 0 && length <= maxLength) {
      postButton.disabled = false;
    } else {
      postButton.disabled = true;
    }
  
    // Change counter color based on remaining characters
    if (length > CONSTANTS.WARNING_THRESHOLD && length <= maxLength) {
      counterElement.classList.remove("text-gray-400", "text-red-500");
      counterElement.classList.add("text-yellow-500");
    } else if (length > maxLength) {
      counterElement.classList.remove("text-gray-400", "text-yellow-500");
      counterElement.classList.add("text-red-500");
    } else {
      counterElement.classList.remove("text-yellow-500", "text-red-500");
      counterElement.classList.add("text-gray-400");
    }
  }