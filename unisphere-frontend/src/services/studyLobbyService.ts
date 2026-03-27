import axios from 'axios';

// Hardcoded Study Lobby API endpoint
const STUDY_LOBBY_API_BASE = 'http://localhost:8084/api/lobbies';

// Interfaces
export interface CreateLobbyRequest {
  title: string;
  maxParticipants: number;
  hostUserId: string;
  hostUsername: string;
}

export interface JoinLobbyRequest {
  lobbyCode: string;
  userId: string;
  username: string;
}

export interface SendMessageRequest {
  senderId: string;
  senderUsername: string;
  content: string;
}

export interface LobbyResponse {
  id: number;
  lobbyCode: string;
  hostUserId: string;
  hostUsername: string;
  title: string;
  maxParticipants: number;
  currentCount: number;
  status: string;
  isFull: boolean;
  createdAt: string;
  startedAt: string;
  endedAt: string;
}

export interface ParticipantResponse {
  id: number;
  userId: string;
  username: string;
  joinedAt: string;
  active: boolean;
}

export interface ChatMessageResponse {
  id: number;
  lobbyCode: string;
  senderId: string;
  senderUsername: string;
  content: string;
  sentAt: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

// API Service
export const studyLobbyService = {
  // Create a new lobby
  createLobby: async (request: CreateLobbyRequest): Promise<LobbyResponse> => {
    try {
      const response = await axios.post<ApiResponse<LobbyResponse>>(
        `${STUDY_LOBBY_API_BASE}/create`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Error creating lobby:', error);
      throw error;
    }
  },

  // Join an existing lobby
  joinLobby: async (request: JoinLobbyRequest): Promise<LobbyResponse> => {
    try {
      const response = await axios.post<ApiResponse<LobbyResponse>>(
        `${STUDY_LOBBY_API_BASE}/join`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Error joining lobby:', error);
      throw error;
    }
  },

  // Get lobby details
  getLobby: async (lobbyCode: string): Promise<LobbyResponse> => {
    try {
      const response = await axios.get<ApiResponse<LobbyResponse>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lobby:', error);
      throw error;
    }
  },

  // Get participants
  getParticipants: async (lobbyCode: string): Promise<ParticipantResponse[]> => {
    try {
      const response = await axios.get<ApiResponse<ParticipantResponse[]>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/participants`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching participants:', error);
      throw error;
    }
  },

  // Start session
  startSession: async (lobbyCode: string, userId: string): Promise<LobbyResponse> => {
    try {
      const response = await axios.put<ApiResponse<LobbyResponse>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/start`,
        {},
        { params: { userId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  },

  // End session
  endSession: async (lobbyCode: string, userId: string): Promise<LobbyResponse> => {
    try {
      const response = await axios.put<ApiResponse<LobbyResponse>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/end`,
        {},
        { params: { userId } }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error ending session:', error);
      throw error;
    }
  },

  // Leave lobby
  leaveLobby: async (lobbyCode: string, userId: string): Promise<void> => {
    try {
      await axios.post(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/leave`,
        {},
        { params: { userId } }
      );
    } catch (error) {
      console.error('Error leaving lobby:', error);
      throw error;
    }
  },

  // Send message
  sendMessage: async (
    lobbyCode: string,
    request: SendMessageRequest
  ): Promise<ChatMessageResponse> => {
    try {
      const response = await axios.post<ApiResponse<ChatMessageResponse>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/messages`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get chat history
  getChatHistory: async (lobbyCode: string): Promise<ChatMessageResponse[]> => {
    try {
      const response = await axios.get<ApiResponse<ChatMessageResponse[]>>(
        `${STUDY_LOBBY_API_BASE}/${lobbyCode}/messages`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw error;
    }
  },
};

