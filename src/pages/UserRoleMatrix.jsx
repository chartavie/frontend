import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, CircularProgress, Card, CardContent,
  Stack, Switch, Tooltip, Avatar, InputBase, Paper, IconButton, Fade
} from '@mui/material';
import { InfoIcon, SearchIcon } from '../Shared/Icons';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext'; 
import {
  getUsers,
  getRoles as getUserRoles,
  assignRole,
  removeRole
} from '../services/userService';
import { getRoles } from '../services/roleService';
import SnackbarAlert from '../Shared/SnackbarAlert'; // Adjust path if needed

export default function UserRoleMatrix() {
  const { theme } = useContext(ThemeContext); 
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [flash, setFlash] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);

  async function fetchMatrix() {
    setLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        getUsers(token),
        getRoles(token),
      ]);
      setUsers(usersRes);
      setRoles(rolesRes);

      const matrixObj = {};
      await Promise.all(usersRes.map(async (user) => {
        const userRoles = await getUserRoles(user.id, token);
        matrixObj[user.id] = new Set(userRoles.map(r => r.id));
      }));
      setMatrix(matrixObj);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      setShowError(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMatrix();
  }, [token]);

  const handleToggle = async (userId, roleId) => {
    const key = `${userId}-${roleId}`;
    setToggling(prev => ({ ...prev, [key]: true }));

    try {
      if (matrix[userId]?.has(roleId)) {
        await removeRole(userId, roleId, token);
        setMatrix(prev => ({
          ...prev,
          [userId]: new Set([...prev[userId]].filter(id => id !== roleId))
        }));
      } else {
        await assignRole(userId, roleId, token);
        setMatrix(prev => ({
          ...prev,
          [userId]: new Set([...prev[userId], roleId])
        }));
        setFlash(f => ({ ...f, [key]: true }));
        setTimeout(() => setFlash(f => ({ ...f, [key]: false })), 800);
      }
    } catch (error) {
      setError(error.message || 'Error toggling role');
      setShowError(true);
    }

    setToggling(prev => ({ ...prev, [key]: false }));
  };

  const filteredUsers = users.filter(user =>
    (user.name || user.email).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <Box textAlign="center" mt={8}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box
      p={{ xs: 2, md: 4 }}
      maxWidth="95vw"
      mx="auto"
      sx={{
        background: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: '100vh'
      }}
    >
      <Typography
        variant="h4"
        mb={3}
        fontWeight={700}
        textAlign="center"
        color={theme.palette.primary.main}
      >
        User-Role Assignment Matrix
      </Typography>

      <Paper
        component="form"
        sx={{
          mb: 4,
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          maxWidth: 500,
          mx: 'auto',
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton disabled>
          <SearchIcon size={20} color={theme.palette.text.secondary} />
        </IconButton>
      </Paper>

      <Stack spacing={3}>
        {filteredUsers.map(user => (
          <Card
            key={user.id}
            variant="outlined"
            sx={{
              borderRadius: 2,
              boxShadow: 1,
              transition: '0.3s',
              '&:hover': { boxShadow: 3 },
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{
                  mr: 2,
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText
                }}>
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {user.name || user.email}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', overflowX: 'auto', gap: 2, pb: 1 }}>
                {roles.map(role => {
                  const key = `${user.id}-${role.id}`;
                  const checked = matrix[user.id]?.has(role.id);
                  const isLoading = toggling[key];
                  const isFlash = flash[key];

                  return (
                    <Tooltip key={role.id} title={role.name} arrow>
                      <Fade in>
                        <Box
                          sx={{
                            minWidth: 120,
                            textAlign: 'center',
                            flexShrink: 0,
                            backgroundColor: isFlash
                              ? theme.palette.success.light
                              : 'transparent',
                            borderRadius: 2,
                            p: 1,
                            transition: 'background-color 0.3s ease-in-out',
                          }}
                        >
                          <Typography variant="body2" noWrap sx={{ mb: 0.5 }}>
                            {role.name}
                          </Typography>
                          <Switch
                            color="primary"
                            checked={checked}
                            onChange={() => handleToggle(user.id, role.id)}
                            disabled={isLoading}
                          />
                        </Box>
                      </Fade>
                    </Tooltip>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {showError && (
        <SnackbarAlert
          open={showError}
          onClose={() => setShowError(false)}
          severity="error"
          message={error}
        />
      )}

      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Box>
  );
}