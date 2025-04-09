/**
 * Module for handling tweet input functionality
 */

import { CONSTANTS, updateCharacterCounter } from './utils.js';
import { createNote } from './apiClient.js';

/**
 * Initializes tweet input functionality with character counter and post button
 * @param {Object} elements - DOM elements required for tweet input functionality
 * @param {HTMLElement} elements.tweetInput - Input field for tweet text
 * @param {HTMLElement} elements.postBtn - Button to post the tweet
 * @param {HTMLElement} elements.charCount - Element displaying character count
 * @param {Function} loadNotes - Function to reload notes after posting
 */
export function initTweetInput({ tweetInput, postBtn, charCount }, loadNotes) {
  // Character counter with Twitter-like color changes
  tweetInput.addEventListener("input", () => {
    const length = tweetInput.value.length;
    updateCharacterCounter(charCount, length, CONSTANTS.MAX_TWEET_LENGTH, postBtn);
  });

  // Post button click handler
  postBtn.addEventListener("click", async () => {
    const text = tweetInput.value.trim();
    if (text) {
      postBtn.disabled = true;
      postBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

      await createNote(text);
      tweetInput.value = "";
      charCount.textContent = `0 / ${CONSTANTS.MAX_TWEET_LENGTH}`;

      postBtn.innerHTML = 'Take note';
      postBtn.disabled = true;

      loadNotes();
    }
  });

  // Initialize with disabled button
  postBtn.disabled = true;
}