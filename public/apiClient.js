/**
 * API Client module for handling all server interactions
 * Contains functions for CRUD operations on notes and replies
 */

/**
 * Fetches all notes from the server
 * @returns {Promise<Array>} Array of note objects
 */
export async function fetchNotes() {
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  }
  
  /**
   * Fetches replies for a specific note
   * @param {string} noteId - ID of the parent note
   * @returns {Promise<Array>} Array of reply objects
   */
  export async function fetchReplies(noteId) {
    try {
      const response = await fetch(`/api/notes/${noteId}/replies`);
      if (!response.ok) {
        throw new Error('Failed to fetch replies');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching replies:', error);
      return [];
    }
  }
  
  /**
   * Creates a new note or reply
   * @param {string} text - Content of the note
   * @param {string|null} parentId - ID of parent note if this is a reply, null for top-level notes
   * @returns {Promise<Object|null>} The created note object or null on failure
   */
  export async function createNote(text, parentId = null) {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, parent_id: parentId })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create note');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  }
  
  /**
   * Deletes a note by ID
   * @param {string} id - ID of the note to delete
   * @returns {Promise<Object|null>} Response object or null on failure
   */
  export async function deleteNote(id) {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting note:', error);
      return null;
    }
  }