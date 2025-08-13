# ReactSlack - Modern Slack Clone

A real-time chat application built with Node.js, Express, MongoDB, React, and TypeScript, featuring modern messaging capabilities with Socket.IO for real-time communication.

## Migration from Legacy Version

This modernized version replaces:

• **Firebase + Redux** → **MongoDB + React Query**
• **Semantic UI React** → **Tailwind CSS v4**
• **Class Components** → **Modern React 19 with Hooks**
• **Manual state management** → **TanStack Query with automatic caching**
• **Basic styling** → **Modern responsive design with Tailwind**
• **Limited real-time features** → **Full Socket.IO integration**

The core functionality (real-time messaging and authentication) remains the same but with a modern, maintainable architecture and superior user experience.

## ✨ Key Features

### 🚀 Real-time Messaging
• Multiple users can chat simultaneously with live message updates
• Instant message delivery and status indicators
• Real-time typing indicators and user presence
• Automatic reconnection when connection is lost

### 💾 Modern State Management
• TanStack Query for intelligent data fetching and caching
• Optimistic updates for immediate message posting
• Automatic background synchronization
• Smart caching reduces unnecessary API calls

### 🔄 Enhanced User Experience
• Instant visual feedback with optimistic updates
• Professional message input with emoji picker
• Auto-scroll to new messages
• Date separators and message grouping
• File attachment support (UI ready)

### 🛠️ Developer Experience
• TypeScript for complete type safety
• Hot module replacement for fast development
• Comprehensive development server scripts
• Modern build tools with Vite
• Docker integration for MongoDB

## Architecture

### Backend (Node.js + Express + MongoDB)
• **Express.js API**: RESTful endpoints with JWT authentication
• **MongoDB**: Document database with Mongoose ODM
• **Socket.IO Hub**: Handles real-time communication for messaging and presence
• **JWT Authentication**: Secure token-based user authentication
• **File Upload Support**: Multer integration for attachments

### Frontend (React 19 + TypeScript + Tailwind CSS + Vite)
• **React 19**: Modern UI library with hooks and concurrent features
• **TypeScript**: Complete type safety across the application
• **TanStack Query**: Powerful data fetching and state management
• **Tailwind CSS v4**: Utility-first CSS framework with modern design
• **Vite**: Fast build tool and development server
• **Socket.IO Client**: Real-time communication with the backend
• **React Hot Toast**: Professional notification system

## Getting Started

### Prerequisites
• **Node.js** (v18 or later)
• **npm** (comes with Node.js)
• **Docker** (for MongoDB)

### Quick Start with Development Scripts

**🐧 macOS/Linux:**
```bash
# Navigate to the New directory
cd ReactSlack/New

# Run the development server script
./dev-server.sh
```

**🪟 Windows:**
```powershell
# Navigate to the New directory
cd ReactSlack\New

# Run the development server script
.\dev-server.ps1
```

The scripts automatically:
• Start MongoDB via Docker Compose
• Install dependencies if needed
• Free up required ports
• Start both backend and frontend servers
• Provide colored status updates

### Manual Setup (Alternative)

1. **Start MongoDB:**
```bash
cd ReactSlack/New
docker-compose -f docker-compose-mongodb.yml up -d
```

2. **Start the Backend API:**
```bash
cd ReactSlack/New/backend
npm install  # First time only
npm run dev
```
The API will start on `http://localhost:3001`.

3. **Start the Frontend:**
```bash
cd ReactSlack/New/frontend
npm install  # First time only  
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port).

4. **Access the application:**
   • Frontend: [http://localhost:5173](http://localhost:5173/)
   • Backend API: [http://localhost:3001](http://localhost:3001/)
   • MongoDB: `mongodb://localhost:27050`

### Testing Real-time Features

1. **Multi-user Testing:**
   • Open the application in multiple browser windows/tabs
   • Open different browsers for more realistic testing

2. **Real-time Messaging:**
   • Register/login as different users in different windows
   • Send messages and see them appear instantly across all windows
   • Messages are delivered in real-time with optimistic updates

3. **User Presence:**
   • Monitor online/offline status of users
   • See typing indicators when users are composing messages

4. **Connection Status:**
   • Monitor the connection status indicators
   • Test connection loss by stopping the backend
   • Watch automatic reconnection attempts

5. **Data Persistence:**
   • Messages persist in MongoDB across sessions
   • User authentication maintains sessions via JWT tokens
   • React Query caching provides instant loading

## Database

The application uses MongoDB with Mongoose ODM. The database is automatically created on first run.

**Collections:**
• `users` - User accounts and profiles
• `channels` - Chat channels and metadata  
• `messages` - Chat messages with references

**Database Connection:** `mongodb://localhost:27050/slack_clone`

## API Endpoints

### Authentication
• `POST /api/auth/register` - Create new user account
• `POST /api/auth/login` - User login with JWT token

### Users
• `GET /api/users` - Get all users
• `GET /api/users/profile` - Get current user profile

### Channels
• `GET /api/channels` - Get user's channels
• `POST /api/channels` - Create new channel
• `GET /api/channels/:id` - Get specific channel

### Messages
• `GET /api/messages/channel/:channelId` - Get channel messages
• `POST /api/messages` - Send new message

## Socket.IO Events

### Client Events (sent from frontend)
• `channel:join` - Join a channel room
• `channel:leave` - Leave a channel room
• `typing:start` - User started typing
• `typing:stop` - User stopped typing

### Server Events (sent from backend)
• `message:new` - New message received
• `message:edited` - Message was edited
• `message:deleted` - Message was deleted  
• `user:online` - User came online
• `user:offline` - User went offline
• `typing:start` - User started typing
• `typing:stop` - User stopped typing

## TanStack Query Integration

### Custom Hooks
• `useMessages(channelId)` - Fetches and caches messages with real-time updates
• `useChannels()` - Manages channel list with cache
• `useAuth()` - Handles authentication state

### Query Features
• **Automatic caching** - Messages cached per channel
• **Background updates** - Fresh data synced automatically
• **Optimistic updates** - Messages appear instantly before server confirmation
• **Error handling** - Automatic retry with rollback on failure
• **Real-time sync** - Socket events update React Query cache

## Connection Status Management

The application provides intelligent connection status feedback:

• 🔄 **Connecting**: "Connecting to server..." (yellow indicator)
• ✅ **Connected**: Socket.IO connection established (green)
• 🔄 **Reconnecting**: "Reconnecting..." (yellow indicator)
• ❌ **Disconnected**: "Connection lost" (red indicator)

**Smart Error Handling:**
• Progressive error messaging after failed attempts
• Automatic reconnection with exponential backoff
• Different messages for initial vs. lost connection scenarios

## Development

### Backend Development
```bash
cd ReactSlack/New/backend
npm run dev  # nodemon with hot reload
```

### Frontend Development  
```bash
cd ReactSlack/New/frontend
npm run dev  # Vite HMR enabled
```

**Development Tools:**
• **React Query DevTools**: Available in development mode
• **Vite HMR**: Instant updates without losing component state
• **TypeScript**: Compile-time type checking
• **ESLint**: Code quality enforcement
• **Hot Toast**: Development-friendly notifications

### Key Dependencies

**Frontend:**
• `@tanstack/react-query` - Data fetching and state management
• `socket.io-client` - Real-time communication
• `react-hot-toast` - Notification system
• `react-router-dom` - Client-side routing
• `@tailwindcss/vite` - Tailwind CSS v4 integration
• `lucide-react` - Modern icon library
• `date-fns` - Date formatting utilities

**Backend:**
• `express` - Web application framework
• `socket.io` - Real-time communication
• `mongoose` - MongoDB ODM
• `jsonwebtoken` - JWT authentication
• `bcryptjs` - Password hashing
• `cors` - Cross-origin resource sharing
• `multer` - File upload handling

### Building for Production

**Backend:**
```bash
cd ReactSlack/New/backend
npm run build
npm start
```

**Frontend:**
```bash
cd ReactSlack/New/frontend
npm run build
# Built files will be in the 'dist' directory
```

## Troubleshooting

### Common Issues

1. **Port Conflicts:**
   • Backend default: `http://localhost:3001`
   • Frontend default: `http://localhost:5173`
   • MongoDB default: `mongodb://localhost:27050`
   • Development scripts automatically handle port conflicts

2. **MongoDB Connection:**
   • Ensure Docker is running
   • Check MongoDB container: `docker ps`
   • Restart MongoDB: `docker-compose -f docker-compose-mongodb.yml restart`

3. **Socket.IO Connection Issues:**
   • Ensure backend is running before frontend
   • Check browser console for WebSocket errors
   • Verify CORS settings in backend

4. **Authentication Issues:**
   • Clear localStorage to reset JWT tokens
   • Check token expiration (7 days default)
   • Verify backend JWT_SECRET environment variable

### Performance Tips

• **TanStack Query** automatically manages request deduplication
• **Optimistic updates** provide instant message posting
• **Socket.IO rooms** efficiently manage real-time updates per channel
• **MongoDB indexing** on frequently queried fields
• **JWT tokens** reduce database lookups for authentication

## Recent Improvements

• ✅ **Complete Modernization** - Migrated from Firebase/Redux to MongoDB/React Query
• ✅ **Tailwind CSS Integration** - Modern responsive design system
• ✅ **Real-time Messaging** - Full Socket.IO implementation with optimistic updates
• ✅ **TypeScript Migration** - Complete type safety across frontend and backend
• ✅ **Development Scripts** - One-command setup for both platforms
• ✅ **Modern Architecture** - React 19, Node.js, Express, MongoDB stack
• ✅ **Professional UI** - Message threading, emoji picker, file upload ready

## Alternative Implementation

🚀 **Firebase + Redux Version Available**

The original implementation using Firebase and Redux is available in the `/Old` directory:

**Legacy Stack:**
• Firebase Authentication & Realtime Database
• Redux for state management  
• Semantic UI React for components
• Create React App build system

This modernized version provides the same chat functionality with improved architecture, better developer experience, and enhanced real-time features.
