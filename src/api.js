const API_URL = 'http://localhost:5005';

class ApiService {
  static async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async register(email, password, name) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async getThreads(token, start = 0) {
    const response = await fetch(`${API_URL}/threads?start=${start}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async getThread(token, threadId) {
    const response = await fetch(`${API_URL}/thread?id=${threadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async getComments(token, threadId) {
    const response = await fetch(`${API_URL}/comments?threadId=${threadId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async createComment(token, threadId, content, parentCommentId = null) {
    const response = await fetch(`${API_URL}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ threadId, content, parentCommentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async deleteComment(token, commentId) {
    const response = await fetch(`${API_URL}/comment`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: commentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async createThread(token, title, isPublic, content) {
    const response = await fetch(`${API_URL}/thread`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, isPublic, content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async getUserProfile(token, userId) {
    const response = await fetch(`${API_URL}/user?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async updateUserProfile(token, userData) {
    const response = await fetch(`${API_URL}/user`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async updateThread(token, threadData) {
    const response = await fetch(`${API_URL}/thread`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(threadData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }

  static async deleteThread(token, threadId) {
    const response = await fetch(`${API_URL}/thread`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: threadId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    return await response.json();
  }
}

export default ApiService;
