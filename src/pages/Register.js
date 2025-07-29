import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await register(form); // Must return user object with id
      navigate('/verify-phone', { state: { userId: res.id } });
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };
  return (
    <Box maxWidth={400} mx="auto" mt={8} p={4} boxShadow={3}>
      <Typography variant="h5" mb={2}>Register</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" fullWidth margin="normal"
          value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
        <TextField label="Email" fullWidth margin="normal"
          value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <TextField label="Phone" fullWidth margin="normal"
          value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>
        <TextField label="Password" type="password" fullWidth margin="normal"
          value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" fullWidth sx={{mt:2}}>Register</Button>
      </form>
    </Box>
  );
}