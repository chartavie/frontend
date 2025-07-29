const API_URL = process.env.REACT_APP_API_URL || '';

async function handleResponse(res, defaultMsg) {
  if (!res.ok) {
    let errorMsg = defaultMsg;
    try {
      const error = await res.json();
      errorMsg = error.error || error.message || defaultMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return await res.json();
}

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res, 'Invalid credentials');
};

export const register = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  return handleResponse(res, 'Registration failed');
};

export const verifyPhone = async (userId, code) => {
  const res = await fetch(`${API_URL}/api/auth/verify-phone`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ userId, code })
  });
  return handleResponse(res, 'Invalid code');
};

export const forgotPassword = async (email) => {
  const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return handleResponse(res, 'Failed to send reset link');
};

export const resetPassword = async ({ token, password }) => {
  const res = await fetch(`${API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password })
  });
  return handleResponse(res, 'Failed to reset password');
};