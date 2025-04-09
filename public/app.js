document.addEventListener('DOMContentLoaded', () => {
  const tweetInput = document.getElementById("tweetInput");
  const postBtn = document.getElementById("postBtn");
  const notesContainer = document.getElementById("notesContainer");
  const charCount = document.getElementById("charCount");

  // Character counter with Twitter-like color changes
  tweetInput.addEventListener("input", () => {
    const length = tweetInput.value.length;
    charCount.textContent = `${length} / 280`;

    // Enable/disable post button based on content
    if (length > 0 && length <= 280) {
      postBtn.disabled = false;
    } else {
      postBtn.disabled = true;
    }

    // Change counter color based on remaining characters
    if (length > 260 && length <= 280) {
      charCount.classList.remove("text-gray-400", "text-red-500");
      charCount.classList.add("text-yellow-500");
    } else if (length > 280) {
      charCount.classList.remove("text-gray-400", "text-yellow-500");
      charCount.classList.add("text-red-500");
    } else {
      charCount.classList.remove("text-yellow-500", "text-red-500");
      charCount.classList.add("text-gray-400");
    }
  });

  async function fetchNotes() {
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

  async function fetchReplies(noteId) {
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

  async function createNote(text, parentId = null) {
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

  async function deleteNote(id) {
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

  function formatDate(dateString) {
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

  async function loadNotes() {
    notesContainer.innerHTML = '<div class="flex justify-center p-4"><div class="twitter-blue"><i class="fas fa-circle-notch fa-spin fa-2x"></i></div></div>';
    const notes = await fetchNotes();

    notesContainer.innerHTML = '';

    if (notes.length === 0) {
      notesContainer.innerHTML = '<div class="text-center text-gray-500 p-4"><p>No tweets yet. Start the conversation!</p></div>';
      return;
    }

    for (const note of notes) {
      const noteDiv = document.createElement("div");
      noteDiv.className = "note-card p-4 my-2 rounded-none first:rounded-t-xl last:rounded-b-xl";

      const noteContent = document.createElement("div");
      noteContent.className = "flex";

      // Avatar
      const avatar = document.createElement("div");
      avatar.className = "avatar mr-3 flex-shrink-0";
      avatar.innerHTML = '<i class="fas fa-user"></i>';
      noteContent.appendChild(avatar);

      // Content container
      const contentContainer = document.createElement("div");
      contentContainer.className = "flex-grow";

      // Header with username and time
      const noteHeader = document.createElement("div");
      noteHeader.className = "flex items-center";

      const userName = document.createElement("span");
      userName.className = "font-bold mr-1";
      userName.textContent = "User";

      const userHandle = document.createElement("span");
      userHandle.className = "text-gray-500 text-sm mr-1";
      userHandle.textContent = "@user";

      const separator = document.createElement("span");
      separator.className = "text-gray-500 mx-1";
      separator.textContent = "·";

      const timestamp = document.createElement("span");
      timestamp.className = "text-gray-500 text-sm";
      timestamp.textContent = formatDate(note.created_at);

      noteHeader.appendChild(userName);
      noteHeader.appendChild(userHandle);
      noteHeader.appendChild(separator);
      noteHeader.appendChild(timestamp);

      // Add delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "ml-auto text-gray-500 hover:text-red-500 focus:outline-none";
      deleteBtn.innerHTML = '<i class="fas fa-trash-alt text-sm"></i>';
      deleteBtn.onclick = async (e) => {
        e.stopPropagation();
        await deleteNote(note.id);
        loadNotes();
      };
      noteHeader.appendChild(deleteBtn);

      contentContainer.appendChild(noteHeader);

      // Note text
      const noteText = document.createElement("p");
      noteText.className = "text-white mt-1 mb-2";
      noteText.textContent = note.text;
      contentContainer.appendChild(noteText);

      // Action buttons
      const actionButtons = document.createElement("div");
      actionButtons.className = "flex justify-between items-center max-w-xs action-icons text-sm";

      // Reply button with icon
      const replyAction = document.createElement("div");
      replyAction.className = "flex items-center group cursor-pointer";
      replyAction.innerHTML = '<i class="far fa-comment mr-2 group-hover:text-blue-400"></i>';
      replyAction.onclick = () => showReplyBox(note.id, contentContainer);

      const replies = await fetchReplies(note.id);

      // Reply counter
      const replyCounter = document.createElement("span");
      replyCounter.className = "group-hover:text-blue-400";
      replyCounter.textContent = replies.length || "";
      replyAction.appendChild(replyCounter);


      actionButtons.appendChild(replyAction);
      contentContainer.appendChild(actionButtons);

      if (replies.length > 0) {
        const toggleRepliesBtn = document.createElement("button");
        toggleRepliesBtn.className = "text-sm text-gray-500 hover:text-blue-400 mt-2 flex items-center";
        toggleRepliesBtn.innerHTML = `
          <span data-count="${replies.length}" class="mr-1 toggle-span">Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}</span>
          <i class="fas fa-chevron-down show-replies-icon"></i>
        `;

        // Replace the toggleRepliesBtn click handler with this:
        toggleRepliesBtn.onclick = () => {
          // Find the repliesContainer more reliably - it should be after the noteContent div
          const repliesContainer = noteDiv.querySelector(".replies-container");
          const icon = toggleRepliesBtn.querySelector(".show-replies-icon");
          const span = toggleRepliesBtn.querySelector(".toggle-span");
          const isOpen = repliesContainer.classList.contains("max-h-[1000px]");

          if (isOpen) {
            repliesContainer.classList.remove("max-h-[1000px]");
            repliesContainer.classList.add("max-h-0");
            icon.classList.remove("fa-chevron-up");
            icon.classList.add("fa-chevron-down");
            span.textContent = `Show ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;
          } else {
            repliesContainer.classList.remove("max-h-0");
            repliesContainer.classList.add("max-h-[1000px]");
            icon.classList.remove("fa-chevron-down");
            icon.classList.add("fa-chevron-up");
            span.textContent = `Hide ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`;
          }
        };

        contentContainer.appendChild(toggleRepliesBtn);
      }

      noteContent.appendChild(contentContainer);
      noteDiv.appendChild(noteContent);

      // Replies container
      const repliesContainer = document.createElement("div");
      repliesContainer.className = "replies-container transition-all max-h-0 overflow-hidden mt-2 ml-12 pl-3";

      // Add replies to the container
      replies.forEach(reply => {
        const replyDiv = document.createElement("div");
        replyDiv.className = "mt-3 pb-3 border-b border-gray-800 relative";

        const replyContent = document.createElement("div");
        replyContent.className = "flex";

        // Avatar for reply
        const replyAvatar = document.createElement("div");
        replyAvatar.className = "avatar mr-3 flex-shrink-0 w-8 h-8 text-xs";
        replyAvatar.innerHTML = '<i class="fas fa-user"></i>';
        replyContent.appendChild(replyAvatar);

        // Reply content container
        const replyContentContainer = document.createElement("div");
        replyContentContainer.className = "flex-grow";

        // Header with username and time
        const replyHeader = document.createElement("div");
        replyHeader.className = "flex items-center";

        const replyUserName = document.createElement("span");
        replyUserName.className = "font-bold mr-1 text-sm";
        replyUserName.textContent = "User";

        const replyUserHandle = document.createElement("span");
        replyUserHandle.className = "text-gray-500 text-xs mr-1";
        replyUserHandle.textContent = "@user";

        const replySeparator = document.createElement("span");
        replySeparator.className = "text-gray-500 mx-1 text-xs";
        replySeparator.textContent = "·";

        const replyTimestamp = document.createElement("span");
        replyTimestamp.className = "text-gray-500 text-xs";
        replyTimestamp.textContent = formatDate(reply.created_at);

        replyHeader.appendChild(replyUserName);
        replyHeader.appendChild(replyUserHandle);
        replyHeader.appendChild(replySeparator);
        replyHeader.appendChild(replyTimestamp);

        // Add delete button for reply
        const replyDeleteBtn = document.createElement("button");
        replyDeleteBtn.className = "ml-auto text-gray-500 hover:text-red-500 focus:outline-none";
        replyDeleteBtn.innerHTML = '<i class="fas fa-trash-alt text-xs"></i>';
        replyDeleteBtn.onclick = async (e) => {
          e.stopPropagation();
          await deleteNote(reply.id);
          loadNotes();
        };
        replyHeader.appendChild(replyDeleteBtn);

        replyContentContainer.appendChild(replyHeader);

        // Reply text
        const replyText = document.createElement("p");
        replyText.className = "text-white text-sm mt-1";
        replyText.textContent = reply.text;
        replyContentContainer.appendChild(replyText);

        // Add action buttons to reply (simplified)
        const replyActionButtons = document.createElement("div");
        replyActionButtons.className = "flex space-x-8 mt-1 action-icons text-xs";
        replyContentContainer.appendChild(replyActionButtons);

        replyContent.appendChild(replyContentContainer);
        replyDiv.appendChild(replyContent);
        repliesContainer.appendChild(replyDiv);
      });

      noteDiv.appendChild(repliesContainer);
      notesContainer.appendChild(noteDiv);
    }
  }

  function showReplyBox(parentId, parentElement) {
    const existing = parentElement.querySelector(".reply-input-container");
    if (existing) {
      existing.remove();
      return;
    }

    const replyContainer = document.createElement("div");
    replyContainer.className = "reply-input-container mt-3 flex";

    // Avatar for reply
    const replyAvatar = document.createElement("div");
    replyAvatar.className = "avatar mr-3 flex-shrink-0 w-8 h-8 text-xs";
    replyAvatar.innerHTML = '<i class="fas fa-user"></i>';
    replyContainer.appendChild(replyAvatar);

    const replyInputWrapper = document.createElement("div");
    replyInputWrapper.className = "flex-grow";

    const replyInput = document.createElement("textarea");
    replyInput.className = "w-full p-2 rounded-lg resize-none border border-gray-700 bg-transparent note-input-area focus:outline-none text-white text-sm";
    replyInput.rows = 2;
    replyInput.placeholder = "Tweet your reply";

    const replyInputActions = document.createElement("div");
    replyInputActions.className = "flex justify-between items-center mt-2";

    const replyCounter = document.createElement("div");
    replyCounter.className = "text-xs text-gray-400";
    replyCounter.textContent = "0 / 280";

    replyInput.addEventListener("input", () => {
      const length = replyInput.value.length;
      replyCounter.textContent = `${length} / 280`;

      // Enable/disable post button based on content
      if (length > 0 && length <= 280) {
        replyPostBtn.disabled = false;
      } else {
        replyPostBtn.disabled = true;
      }

      // Change counter color based on remaining characters
      if (length > 260 && length <= 280) {
        replyCounter.classList.remove("text-gray-400", "text-red-500");
        replyCounter.classList.add("text-yellow-500");
      } else if (length > 280) {
        replyCounter.classList.remove("text-gray-400", "text-yellow-500");
        replyCounter.classList.add("text-red-500");
      } else {
        replyCounter.classList.remove("text-yellow-500", "text-red-500");
        replyCounter.classList.add("text-gray-400");
      }
    });

    const replyPostBtn = document.createElement("button");
    replyPostBtn.className = "btn-tweet py-1 px-3 rounded-full text-sm disabled:opacity-50";
    replyPostBtn.textContent = "Reply";
    replyPostBtn.disabled = true;

    replyPostBtn.onclick = async () => {
      const text = replyInput.value.trim();
      if (text) {
        await createNote(text, parentId);
        loadNotes();

        // Auto-open replies for this parent after loading
        setTimeout(() => {
          const noteElements = document.querySelectorAll("#notesContainer > div");
          for (const noteElem of noteElements) {
            const noteTextElem = noteElem.querySelector("p.text-white");
            const parentTextElem = parentElement.querySelector("p.text-white");

            if (noteTextElem && parentTextElem &&
              noteTextElem.textContent === parentTextElem.textContent) {

              const toggleBtn = noteElem.querySelector("button:has(.show-replies-icon)");
              if (toggleBtn) {
                toggleBtn.click();
              }
              break;
            }
          }
        }, 100);
      }
    };

    replyInputActions.appendChild(replyCounter);
    replyInputActions.appendChild(replyPostBtn);

    replyInputWrapper.appendChild(replyInput);
    replyInputWrapper.appendChild(replyInputActions);
    replyContainer.appendChild(replyInputWrapper);

    parentElement.appendChild(replyContainer);
    replyInput.focus();
  }

  postBtn.addEventListener("click", async () => {
    const text = tweetInput.value.trim();
    if (text) {
      postBtn.disabled = true;
      postBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';

      await createNote(text);
      tweetInput.value = "";
      charCount.textContent = "0 / 280";

      postBtn.innerHTML = 'Take note';
      postBtn.disabled = true;

      loadNotes();
    }
  });

  // Initialize with disabled button
  postBtn.disabled = true;

  // Initial load
  loadNotes();
});