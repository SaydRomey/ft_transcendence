// frontend/src/api.ts

// ─── Type Definitions ──────────────────────────────────────────────

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  twoFactorCode?: string | null;
}

export interface LogoutRequest {
  id: number;
}

export type UserStatus = "online" | "offline" | "in-game" | "anonymized";

export interface PublicUser {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  status: UserStatus;
  wins: number;
  losses: number;
  matchesPlayed: number;
  isTwoFactorEnabled: boolean;
}

export interface Setup2FAResponse {
  secret: string;
  qrCode: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  avatar?: string;
  status?: UserStatus;
}

export interface UserStatsUpdate {
  wins?: number;
  losses?: number;
  matchesPlayed?: number;
}

export interface UserStats {
  wins: number;
  losses: number;
  matchesPlayed: number;
  winRatio: number;
}

export interface MatchScore {
  player1: number;
  player2: number;
}

export interface Match {
  matchId: number;
  player1: number;
  player2: number;
  winner?: number | null;
  score: MatchScore;
  startTime: string;
  endTime?: string | null;
  matchType: string;
  tournamentId?: number | null;
}

export interface MatchHistory {
  date: string;
  type: string;
  result: string;
}

export interface NewMatchHistoryEntry {
  userId: number;
  type: string;
  result: string;
}

export interface NewMatchRequest {
  player1: number;
  player2: number;
  score: MatchScore;
  startTime: string;
  matchType: string;
  tournamentId?: number | null;

}

export interface MatchUpdateRequest {
  winner?: number;
  score?: MatchScore;
  endTime?: string;
}

export interface MatchResultRequest {
  matchId: number;
  winner: number;
  score?: MatchScore;
}

export interface HealthResponse {
  status: string;
}

// ─── API Client Class ──────────────────────────────────────────────

export class API {
  private baseUrl: string;

  constructor(baseUrl: string = "") {
    
    // Set to the backend URL (e.g., "http://localhost:3000" or "" if using nginx)
    this.baseUrl = baseUrl;
  }

  // Generic request method with centralized error handling.
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers,
      ...options,
    });

    const responseData = await response.json();

    if (!response.ok) {

      // Preserve detailed error messages from the backend
      const errorMessage = responseData.error || response.statusText;
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }

    return responseData;
  }

  // ── Health Check ──────────────────────────────────────────────

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>("/health");
  }

  // ── Auth Endpoints ──────────────────────────────────────────────

  async registerUser(data: RegisterRequest): Promise<PublicUser> {
    return this.request<PublicUser>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Login with 2FA support
  async loginUser(
    data: LoginRequest
  ): Promise<{ message: string; user?: PublicUser; requires2FA?: boolean }> {
    const response = await this.request<{ message: string; token?: string; user?: PublicUser; requires2FA?: boolean }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    // If the login response contains a token, save it
    if (response && response.token) {
      localStorage.setItem('token', response.token);
    }

    return response;
  }

  async logoutUser(data: LogoutRequest): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>("/auth/logout", {
      method: "POST",
      body: JSON.stringify(data),
    });

    // Clear token on logout
    localStorage.removeItem('token');
    return response;
  }

  // ── User Endpoints ──────────────────────────────────────────────

  async getUsers(): Promise<PublicUser[]> {
    return this.request<PublicUser[]>("/users");
  }

  async getUser(id: number): Promise<PublicUser> {
    return this.request<PublicUser>(`/users/${id}`);
  }

  async updateUser(
    id: number,
    data: UpdateUserRequest
  ): Promise<{ message: string; user: PublicUser }> {
    return this.request<{ message: string; user: PublicUser }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/password`, {
      method: "PUT",
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async deleteUser(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  // ── User Stats Endpoints ──────────────────────────────────────────

  // Update user stats by incrementing values
  async updateUserStats(userId: number, stats: Partial<UserStats>): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/stats`, {
      method: "PUT",
      body: JSON.stringify(stats),
    });
  }

  // Retrieve user stats from the backend
  async getUserStats(userId: number): Promise<UserStats> {
    return this.request<UserStats>(`/users/${userId}/stats`);
  }

  // ── Friend Endpoints ──────────────────────────────────────────────

  // Get friend list for a user
  async getFriends(userId: number): Promise<PublicUser[]> {
    return this.request<PublicUser[]>(`/users/${userId}/friends`);
  }

  // Add a friend
  async addFriend(userId: number, friendId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/friends`, {
      method: "POST",
      body: JSON.stringify({ friendId }),
    });
  }

  // Remove a friend
  async removeFriend(userId: number, friendId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/friends/${friendId}`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  }

  // ── Matches Endpoints ──────────────────────────────────────────────

  async getMatches(): Promise<Match[]> {
    return this.request<Match[]>("/matches");
  }

  async getMatch(matchId: number): Promise<Match> {
    return this.request<Match>(`/matches/${matchId}`);
  }

  async createMatch(data: NewMatchRequest): Promise<{ message: string; matchId: number }> {
    return this.request<{ message: string; matchId: number }>("/matches", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMatch(matchId: number, data: MatchUpdateRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/matches/${matchId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async submitMatchResult(data: MatchResultRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>("/matches/result", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserMatchHistory(userId: number): Promise<MatchHistory[]> {
    return this.request<MatchHistory[]>(`/matches/history/${userId}`);
  }

  // ── Match History Endpoint ────────────────────────────────────────────

  // Create a new match history entry
  async createMatchHistoryEntry(data: NewMatchHistoryEntry): Promise<{ message: string; id: number }> {
    return this.request<{ message: string; id: number }>("/matchHistory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Get match history for a user
  async getMatchHistory(userId: number): Promise<MatchHistory[]> {
    return this.request<MatchHistory[]>(`/matchHistory/${userId}`);
  }

  // ── Avatar Endpoints ──────────────────────────────────────────────────

  // Upload avatar (expects a FormData object, so do not set Content-Type manually)
  async uploadAvatar(formData: FormData): Promise<{ message: string; avatarUrl: string }> {

    // Retrieve token from localStorage
    const token = localStorage.getItem('token');

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}/avatars`, {
      method: "POST",
      headers,
      body: formData, // Browser sets the Content-Type automatically
    });

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || response.statusText;
      throw new Error(`Error ${response.status}: ${errorMessage}`);
    }
    return data;
  }

  // Update avatar reference in the database
  async updateAvatar(userId: number, avatarUrl: string): Promise<{ message: string; avatarUrl: string }> {
    return this.request<{ message: string; avatarUrl: string }>(`/avatars`, {
      method: "PUT",
      body: JSON.stringify({ userId, avatarUrl }),
    });
  }

  // Remove avatar (revert to default)
  async removeAvatar(userId: number): Promise<{ message: string; avatarUrl: string }> {
    return this.request<{ message: string; avatarUrl: string }>(`/avatars`, {
      method: "DELETE",
      body: JSON.stringify({ userId }),
    });
  }

  // ── Anonymisation ─────────────────────────────────────────────────────

  // Anonymize user data
  async anonymizeUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/anonymize`, {
      method: "PUT",
      body: JSON.stringify({})
    });
  }

  // Export user data 
  async exportUserData(userId: number): Promise<any> {
    return this.request<any>(`/users/${userId}/export`, {
      method: "GET",
    });
  }

  // ── 2FA ───────────────────────────────────────────────────────────────

  async setup2FA(userId: number): Promise<{ secret: string; qrCode: string }> {
    const response = await this.request<{ secret: string; qrCode: string }>(`/auth/setup-2fa`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    });

    return response;
  }

  // Confirm and enable 2FA after QR scan
  async confirm2FASetup(userId: number, token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/auth/confirm-2fa`, {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    });
  }

  // Verify 2FA Token
  async verify2FA(userId: number, token: string): Promise<{ message: string; token?: string }> {
    return this.request<{ message: string; token?: string }>(`/auth/verify-2fa`, {
      method: "POST",
      body: JSON.stringify({ userId, token }),
    });
  }

  // Disable 2FA
  async disable2FA(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>("/auth/disable-2fa", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
  }

}
