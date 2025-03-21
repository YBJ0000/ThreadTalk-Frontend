const API_URL = 'http://localhost:5005';

class ApiService {
  static async login(email, password) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  static async register(email, password, name) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  static async getThreads(token, start = 0) {
    try {
      console.log('Fetching threads with token:', token); // 添加这行来检查 token
      const response = await fetch(`${API_URL}/threads?start=${start}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      console.log('API response:', data); // 添加这行来查看 API 响应
      return data;
    } catch (error) {
      console.error('Error fetching threads:', error); // 添加错误日志
      throw error;
    }
}

  static async getThread(token, threadId) {
    try {
      // 使用正确的查询参数格式
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
    } catch (error) {
      throw error;
    }
}

static async getComments(token, threadId) {
    try {
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
    } catch (error) {
      throw error;
    }
}

static async createComment(token, threadId, content) {
    try {
      const response = await fetch(`${API_URL}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
}

static async deleteComment(token, commentId) {
    try {
      const response = await fetch(`${API_URL}/comment?id=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
}

  static async createThread(token, title, isPublic, content) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  static async getComments(token, threadId) {
    try {
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
    } catch (error) {
      throw error;
    }
  }

  static async createComment(token, threadId, content) {
    try {
      const response = await fetch(`${API_URL}/thread/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ threadId, content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteComment(token, commentId) {
    try {
      const response = await fetch(`${API_URL}/thread/comment?commentId=${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }
}

export default ApiService;