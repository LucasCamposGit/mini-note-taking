/**
 * Main entry point for the Twitter-like note taking application
 * Initializes components and sets up event listeners
 */

import { initTweetInput } from './tweetInputHandler.js';
import { createNotesRenderer } from './notesRenderer.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const tweetInput = document.getElementById("tweetInput");
  const postBtn = document.getElementById("postBtn");
  const notesContainer = document.getElementById("notesContainer");
  const charCount = document.getElementById("charCount");

  // Initialize modules
  const notesRenderer = createNotesRenderer(notesContainer);
  
  // Initialize tweet input with elements and loadNotes callback
  initTweetInput(
    { tweetInput, postBtn, charCount }, 
    notesRenderer.loadNotes
  );

  // Initial load of notes
  notesRenderer.loadNotes();
});