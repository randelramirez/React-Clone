export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  isDirectMessage: boolean;
  members: User[];
  admins: User[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content?: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  sender: User;
  channel: string;
  isEdited: boolean;
  editedAt?: string;
  replyTo?: Message;
  reactions: Reaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface ApiError {
  message: string;
  errors?: string[];
}
