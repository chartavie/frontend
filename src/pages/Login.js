import React, { useState, useContext } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { AuthContext } from '../contexts/AuthContext'; // <-- import

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext); // <-- get setUser

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login(form.email, form.password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        setUser(res.user); // <-- update context with user info
      }
      navigate('/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8} p={4} boxShadow={3}>
      <Typography variant="h5" mb={2}>Sign In</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Email" fullWidth margin="normal"
          value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <TextField label="Password" type="password" fullWidth margin="normal"
          value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth sx={{mt:2}}>Login</Button>
      </form>
      <Button onClick={()=>navigate('/forgot-password')} sx={{mt:1}}>Forgot Password?</Button>
      <Button onClick={()=>navigate('/register')} sx={{mt:1}}>Don't have an account? Register</Button>
    </Box>
  );
}