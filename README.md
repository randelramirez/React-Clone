# React-Clone - Modernized

A real-time chat application with multiple backend options (Node.js and .NET Core) and frontend implementations, featuring modern messaging capabilities with Socket.IO for real-time communication, built with React, TypeScript, and MongoDB.

## Migration from Legacy Version

This modernized version replaces:

- **Firebase + Redux** → **MongoDB + React Query**
- **Semantic UI React** → **Tailwind CSS v4**
- **Class Components** → **Modern React 19 with Hooks**
- **Manual state management** → **TanStack Query with automatic caching**
- **Basic styling** → **Modern responsive design with Tailwind**
- **Limited real-time features** → **Full Socket.IO integration**

The core functionality (real-time messaging and authentication) remains the same but with a modern, maintainable architecture and superior user experience.

## 🤔 Which Implementation Should You Choose?

### 🟢 Node.js Backend (`backend/node-js/` + `frontend/node-js/`)
**Best for:**
- Developers familiar with JavaScript/TypeScript full-stack development
- Rapid prototyping and development
- Teams already using Node.js ecosystem
- Deployment on platforms like Heroku, Vercel, or DigitalOcean
- Cross-platform development (Windows, macOS, Linux)

**Advantages:**
- Single language (TypeScript) across frontend and backend
- Extensive npm ecosystem
- Fast development iteration
- Excellent community support
- Built-in development scripts for quick setup

### 🔵 .NET Backend (`backend/dotnet/` + `frontend/dotnet/`)
**Best for:**
- Developers familiar with C# and .NET ecosystem
- Enterprise applications requiring robust type safety
- Windows-first development environments
- Integration with Microsoft services (Azure, SQL Server)
- High-performance requirements

**Advantages:**
- Strong typing with C#
- Excellent IDE support with Visual Studio
- Enterprise-grade frameworks and libraries
- Superior performance for CPU-intensive operations
- Seamless Azure integration

**Note:** Both implementations share the same MongoDB database schema and provide identical functionality to users.

## ✨ Key Features

### 🚀 Real-time Messaging
- Multiple users can chat simultaneously with live message updates
- Instant message delivery and status indicators
- Real-time typing indicators and user presence
- Automatic reconnection when connection is lost

### 💾 Modern State Management
- TanStack Query for intelligent data fetching and caching
- Optimistic updates for immediate message posting
- Automatic background synchronization
- Smart caching reduces unnecessary API calls

### 🔄 Enhanced User Experience
- Instant visual feedback with optimistic updates
- Professional message input with emoji picker
- Auto-scroll to new messages
- Date separators and message grouping
- File attachment support (UI ready)

### 🛠️ Developer Experience
- TypeScript for complete type safety
- Hot module replacement for fast development
- Comprehensive development server scripts
- Modern build tools with Vite
- Docker integration for MongoDB

## Architecture

The project offers multiple implementation options:

### Backend Options

#### 🟢 Node.js Backend (`backend/node-js/`)
- **Express.js API**: RESTful endpoints with JWT authentication
- **MongoDB**: Document database with Mongoose ODM
- **Socket.IO Hub**: Handles real-time communication for messaging and presence
- **JWT Authentication**: Secure token-based user authentication
- **File Upload Support**: Multer integration for attachments

#### 🔵 .NET Core Backend (`backend/dotnet/`)
- **ASP.NET Core API**: RESTful endpoints with JWT authentication
- **Entity Framework Core**: ORM for database operations
- **SignalR Hub**: Real-time communication for messaging and presence
- **JWT Authentication**: Secure token-based user authentication
- **File Upload Support**: Built-in ASP.NET Core file handling

### Frontend Options

#### React Frontend with Node.js Backend (`frontend/node-js/`)
- **React 19**: Modern UI library with hooks and concurrent features
- **TypeScript**: Complete type safety across the application
- **TanStack Query**: Powerful data fetching and state management
- **Tailwind CSS v4**: Utility-first CSS framework with modern design
- **Vite**: Fast build tool and development server
- **Socket.IO Client**: Real-time communication with Node.js backend

#### React Frontend with .NET Backend (`frontend/dotnet/`)
- **React 19**: Modern UI library with hooks and concurrent features
- **TypeScript**: Complete type safety across the application
- **TanStack Query**: Powerful data fetching and state management
- **Tailwind CSS v4**: Utility-first CSS framework with modern design
- **Vite**: Fast build tool and development server
- **SignalR Client**: Real-time communication with .NET backend

## Getting Started

### Prerequisites
- **Node.js** (v18 or later)
- **npm** (comes with Node.js)
- **Docker** (for MongoDB)

### Quick Start with Development Scripts

Choose your preferred implementation:

#### 🟢 Node.js Backend + React Frontend

**🐧 macOS/Linux:**
```bash
# Navigate to the React-Clone directory
cd React-Clone

# Run the development server script for Node.js stack
./frontend/dev-server.sh
```

**🪟 Windows:**
```powershell
# Navigate to the React-Clone directory
cd React-Clone

# Run the development server script for Node.js stack
.\frontend\dev-server.ps1
```

#### 🔵 .NET Backend + React Frontend

**🪟 Windows (Recommended for .NET):**
```powershell
# Navigate to the React-Clone directory
cd React-Clone

# Start MongoDB
docker-compose -f docker-compose-mongodb.yml up -d

# Start .NET backend
cd backend\dotnet
dotnet run

# In a new terminal, start React frontend
cd ..\..\frontend\dotnet
npm install  # First time only
npm run dev
```

**🐧 macOS/Linux (.NET with Docker):**
```bash
# Navigate to the React-Clone directory
cd React-Clone

# Start MongoDB
docker-compose -f docker-compose-mongodb.yml up -d

# Start .NET backend (requires .NET SDK)
cd backend/dotnet
dotnet run

# In a new terminal, start React frontend
cd ../../frontend/dotnet
npm install  # First time only
npm run dev
```

The scripts automatically:
- Start MongoDB via Docker Compose
- Install dependencies if needed
- Free up required ports
- Start both backend and frontend servers
- Provide colored status updates

### Manual Setup (Alternative)

#### For Node.js Backend

1. **Start MongoDB:**
```bash
cd React-Clone
docker-compose -f docker-compose-mongodb.yml up -d
```

2. **Start the Node.js Backend API:**
```bash
cd React-Clone/backend/node-js
npm install  # First time only
npm run dev
```
The API will start on `http://localhost:3001`.

3. **Start the React Frontend (Node.js version):**
```bash
cd React-Clone/frontend/node-js
npm install  # First time only  
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port).

#### For .NET Backend

1. **Start MongoDB:**
```bash
cd React-Clone
docker-compose -f docker-compose-mongodb.yml up -d
```

2. **Start the .NET Backend API:**
```bash
cd React-Clone/backend/dotnet
dotnet run
```
The API will start on `http://localhost:5000` (or as configured in launchSettings.json).

3. **Start the React Frontend (.NET version):**
```bash
cd React-Clone/frontend/dotnet
npm install  # First time only  
npm run dev
```
The frontend will start on `http://localhost:5173` (or next available port).

4. **Access the application:**

   **Node.js Backend:**
   - Frontend: [http://localhost:5173](http://localhost:5173/)
   - Backend API: [http://localhost:3001](http://localhost:3001/)
   - MongoDB: `mongodb://localhost:27050`

   **.NET Backend:**
   - Frontend: [http://localhost:5173](http://localhost:5173/)
   - Backend API: [http://localhost:5000](http://localhost:5000/) (or configured port)
   - MongoDB: `mongodb://localhost:27050`

### Testing Real-time Features

1. **Multi-user Testing:**
   - Open the application in multiple browser windows/tabs
   - Open different browsers for more realistic testing

2. **Real-time Messaging:**
   - Register/login as different users in different windows
   - Send messages and see them appear instantly across all windows
   - Messages are delivered in real-time with optimistic updates

3. **User Presence:**
   - Monitor online/offline status of users
   - See typing indicators when users are composing messages

4. **Connection Status:**
   - Monitor the connection status indicators
   - Test connection loss by stopping the backend
   - Watch automatic reconnection attempts

5. **Data Persistence:**
   - Messages persist in MongoDB across sessions
   - User authentication maintains sessions via JWT tokens
   - React Query caching provides instant loading

## Database

The application uses MongoDB with Mongoose ODM. The database is automatically created on first run.

**Collections:**
- `users` - User accounts and profiles
- `channels` - Chat channels and metadata  
- `messages` - Chat messages with references

**Database Connection:** `mongodb://localhost:27050/slack_clone`

*Note: Both Node.js and .NET backends use the same MongoDB database schema for data compatibility.*

## API Endpoints

*Both Node.js and .NET backends implement the same API contract for frontend compatibility.*

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login with JWT token

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile

### Channels
- `GET /api/channels` - Get user's channels
- `POST /api/channels` - Create new channel
- `GET /api/channels/:id` - Get specific channel

### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages` - Send new message

## Real-time Communication

### Node.js Backend (Socket.IO Events)

#### Client Events (sent from frontend)
- `channel:join` - Join a channel room
- `channel:leave` - Leave a channel room
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

#### Server Events (sent from backend)
- `message:new` - New message received
- `message:edited` - Message was edited
- `message:deleted` - Message was deleted  
- `user:online` - User came online
- `user:offline` - User went offline
- `typing:start` - User started typing
- `typing:stop` - User stopped typing

### .NET Backend (SignalR Events)

#### Client Methods (called from frontend)
- `JoinChannel` - Join a channel room
- `LeaveChannel` - Leave a channel room
- `StartTyping` - User started typing
- `StopTyping` - User stopped typing

#### Server Methods (sent from backend)
- `ReceiveMessage` - New message received
- `MessageEdited` - Message was edited
- `MessageDeleted` - Message was deleted
- `UserOnline` - User came online
- `UserOffline` - User went offline
- `UserStartedTyping` - User started typing
- `UserStoppedTyping` - User stopped typing

## TanStack Query Integration

### Custom Hooks
- `useMessages(channelId)` - Fetches and caches messages with real-time updates
- `useChannels()` - Manages channel list with cache
- `useAuth()` - Handles authentication state

### Query Features
- **Automatic caching** - Messages cached per channel
- **Background updates** - Fresh data synced automatically
- **Optimistic updates** - Messages appear instantly before server confirmation
- **Error handling** - Automatic retry with rollback on failure
- **Real-time sync** - Socket.IO/SignalR events update React Query cache

## Connection Status Management

The application provides intelligent connection status feedback:

- 🔄 **Connecting**: "Connecting to server..." (yellow indicator)
- ✅ **Connected**: Socket.IO/SignalR connection established (green)
- 🔄 **Reconnecting**: "Reconnecting..." (yellow indicator)
- ❌ **Disconnected**: "Connection lost" (red indicator)

**Smart Error Handling:**
- Progressive error messaging after failed attempts
- Automatic reconnection with exponential backoff
- Different messages for initial vs. lost connection scenarios

## Development

### Node.js Backend Development
```bash
cd React-Clone/backend/node-js
npm run dev  # nodemon with hot reload
```

### .NET Backend Development
```bash
cd React-Clone/backend/dotnet
dotnet run  # or dotnet watch run for hot reload
```

### Frontend Development  
```bash
# For Node.js backend variant
cd React-Clone/frontend/node-js
npm run dev  # Vite HMR enabled

# For .NET backend variant
cd React-Clone/frontend/dotnet
npm run dev  # Vite HMR enabled
```

**Development Tools:**
- **React Query DevTools**: Available in development mode
- **Vite HMR**: Instant updates without losing component state
- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality enforcement
- **Hot Toast**: Development-friendly notifications

### Key Dependencies

**Frontend (Both Variants):**
- `@tanstack/react-query` - Data fetching and state management
- `react-hot-toast` - Notification system
- `react-router-dom` - Client-side routing
- `@tailwindcss/vite` - Tailwind CSS v4 integration
- `lucide-react` - Modern icon library
- `date-fns` - Date formatting utilities

**Frontend (Node.js variant):**
- `socket.io-client` - Real-time communication with Node.js backend

**Frontend (.NET variant):**
- `@microsoft/signalr` - Real-time communication with .NET backend

**Node.js Backend:**
- `express` - Web application framework
- `socket.io` - Real-time communication
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin resource sharing
- `multer` - File upload handling

**.NET Backend:**
- `Microsoft.AspNetCore.SignalR` - Real-time communication
- `MongoDB.Driver` - MongoDB .NET driver
- `Microsoft.AspNetCore.Authentication.JwtBearer` - JWT authentication
- `BCrypt.Net-Next` - Password hashing

### Building for Production

**Node.js Backend:**
```bash
cd React-Clone/backend/node-js
npm run build
npm start
```

**.NET Backend:**
```bash
cd React-Clone/backend/dotnet
dotnet build
dotnet publish -c Release
```

**Frontend (Both Variants):**
```bash
# For Node.js backend variant
cd React-Clone/frontend/node-js
npm run build

# For .NET backend variant
cd React-Clone/frontend/dotnet
npm run build

# Built files will be in the 'dist' directory
```

## Troubleshooting

### Common Issues

1. **Port Conflicts:**
   - Node.js Backend default: `http://localhost:3001`
   - .NET Backend default: `http://localhost:5000` (check launchSettings.json)
   - Frontend default: `http://localhost:5173`
   - MongoDB default: `mongodb://localhost:27050`
   - Development scripts automatically handle port conflicts

2. **MongoDB Connection:**
   - Ensure Docker is running
   - Check MongoDB container: `docker ps`
   - Restart MongoDB: `docker-compose -f docker-compose-mongodb.yml restart`

3. **Real-time Communication Issues:**
   - **Node.js Backend**: Check Socket.IO WebSocket errors in browser console
   - **.NET Backend**: Check SignalR connection errors in browser console
   - Ensure backend is running before frontend
   - Verify CORS settings in backend

4. **Authentication Issues:**
   - Clear localStorage to reset JWT tokens
   - Check token expiration (7 days default)
   - Verify backend JWT_SECRET environment variable (Node.js) or JWT settings (.NET)

### Performance Tips

- **TanStack Query** automatically manages request deduplication
- **Optimistic updates** provide instant message posting
- **Socket.IO/SignalR rooms** efficiently manage real-time updates per channel
- **MongoDB indexing** on frequently queried fields
- **JWT tokens** reduce database lookups for authentication
- **Both backends** implement identical caching strategies for optimal performance

## Recent Improvements

- ✅ **Complete Modernization** - Migrated from Firebase/Redux to MongoDB/React Query
- ✅ **Multiple Backend Options** - Both Node.js/Express and .NET Core implementations
- ✅ **Dual Frontend Support** - Optimized React frontends for each backend type
- ✅ **Tailwind CSS Integration** - Modern responsive design system
- ✅ **Real-time Messaging** - Full Socket.IO and SignalR implementation with optimistic updates
- ✅ **TypeScript Migration** - Complete type safety across frontend and backend
- ✅ **Development Scripts** - One-command setup for Node.js stack
- ✅ **Cross-Platform Support** - Windows (.NET focus) and macOS/Linux (Node.js focus)
- ✅ **Professional UI** - Message threading, emoji picker, file upload ready
- ✅ **Unified API Contract** - Both backends implement identical REST APIs for frontend compatibility

