# Mini Note-Taking App with SQLite Backend

This is a simple note-taking application that uses SQLite for data storage and Node.js/Express for the backend.

## Features

- Create notes and replies
- View all notes and their replies
- Delete notes (and all associated replies)
- Character count for posts
- Persistent storage using SQLite

## Setup Instructions

1. Make sure you have Node.js installed on your system
2. Clone or download this repository
3. Navigate to the project directory in your terminal
4. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

6. Open your browser and go to `http://localhost:3000`

## Project Structure

- `server.js` - Main backend application file with Express and SQLite setup
- `public/` - Frontend files
  - `index.html` - Main HTML file
  - `app.js` - Frontend JavaScript for interacting with the API
- `notes.db` - SQLite database file (created automatically on first run)

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  parent_id INTEGER NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES notes (id) ON DELETE CASCADE
);
```

## API Endpoints

- `GET /api/notes` - Get all main notes (no parent)
- `GET /api/notes/:id/replies` - Get replies for a specific note
- `POST /api/notes` - Create a new note or reply
- `DELETE /api/notes/:id` - Delete a note and its replies