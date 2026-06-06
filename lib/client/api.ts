const API_BASE = "/api/v1";

export interface ApiError {
  detail: string;
}

export interface UserPublic {
  id: string;
  email: string;
  fullName: string | null;
  isActive: boolean;
  isSuperuser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  organisation: string;
  description: string | null;
  ownerId: string;
  owner?: {
    id: string;
    email: string;
    fullName: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: UserPublic;
}

function authHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "An error occurred" }));
    throw new Error(error.detail || "An error occurred");
  }
  return response.json();
}

// Shared JSON request: attaches the bearer token (when present), serializes the
// body, and unwraps errors. Endpoints that need a non-JSON body (login) build
// their own request.
async function apiRequest<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const { method = "GET", body } = options;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeader() },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return handleResponse<T>(response);
}

// Auth API
export const AuthApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    // OAuth2 password flow expects form-encoded credentials.
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${API_BASE}/login/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });

    return handleResponse<LoginResponse>(response);
  },

  testToken(): Promise<UserPublic> {
    return apiRequest<UserPublic>("/login/test-token", { method: "POST" });
  },
};

// Users API
export const UsersApi = {
  getMe(): Promise<UserPublic> {
    return apiRequest<UserPublic>("/users/me");
  },

  updateMe(data: { email?: string; full_name?: string }): Promise<UserPublic> {
    return apiRequest<UserPublic>("/users/me", { method: "PATCH", body: data });
  },

  changePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<void> {
    return apiRequest<void>("/users/me/password", {
      method: "PATCH",
      body: data,
    });
  },

  deleteMe(): Promise<void> {
    return apiRequest<void>("/users/me", { method: "DELETE" });
  },

  signup(data: {
    email: string;
    password: string;
    full_name?: string;
  }): Promise<UserPublic> {
    return apiRequest<UserPublic>("/users/signup", {
      method: "POST",
      body: data,
    });
  },

  list(skip = 0, limit = 100): Promise<PaginatedResponse<UserPublic>> {
    return apiRequest<PaginatedResponse<UserPublic>>(
      `/users?skip=${skip}&limit=${limit}`,
    );
  },

  create(data: {
    email: string;
    password: string;
    full_name?: string;
    is_superuser?: boolean;
  }): Promise<UserPublic> {
    return apiRequest<UserPublic>("/users", { method: "POST", body: data });
  },

  get(userId: string): Promise<UserPublic> {
    return apiRequest<UserPublic>(`/users/${userId}`);
  },

  update(
    userId: string,
    data: {
      email?: string;
      password?: string;
      full_name?: string;
      is_superuser?: boolean;
      is_active?: boolean;
    },
  ): Promise<UserPublic> {
    return apiRequest<UserPublic>(`/users/${userId}`, {
      method: "PATCH",
      body: data,
    });
  },

  delete(userId: string): Promise<void> {
    return apiRequest<void>(`/users/${userId}`, { method: "DELETE" });
  },
};

// Contacts API
export const ContactsApi = {
  list(skip = 0, limit = 100): Promise<PaginatedResponse<Contact>> {
    return apiRequest<PaginatedResponse<Contact>>(
      `/contacts?skip=${skip}&limit=${limit}`,
    );
  },

  create(data: {
    organisation: string;
    description?: string;
  }): Promise<Contact> {
    return apiRequest<Contact>("/contacts", { method: "POST", body: data });
  },

  get(contactId: string): Promise<Contact> {
    return apiRequest<Contact>(`/contacts/${contactId}`);
  },

  update(
    contactId: string,
    data: { organisation?: string; description?: string },
  ): Promise<Contact> {
    return apiRequest<Contact>(`/contacts/${contactId}`, {
      method: "PUT",
      body: data,
    });
  },

  delete(contactId: string): Promise<void> {
    return apiRequest<void>(`/contacts/${contactId}`, { method: "DELETE" });
  },
};
