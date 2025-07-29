import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, CircularProgress, Card, CardContent,
  Stack, Switch, Tooltip, Divider, Avatar,
  InputBase, Paper, IconButton, Fade
} from '@mui/material';
import { SearchIcon } from '../Shared/Icons';
import { ThemeContext } from '../contexts/ThemeContext';
import {
  getRoles,
  fetchPermissions,
  fetchRolePermissions,
  updateRolePermission,
  assignPermission,
  removePermission
} from '../services/roleService';
import SnackbarAlert from '../Shared/SnackbarAlert';

export default function RBACMatrix() {
  const { theme } = useContext(ThemeContext);

  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState({});
  const [flash, setFlash] = useState({});
  const [search, setSearch] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  async function fetchMatrix() {
    setLoading(true);
    try {
      const [roleList, permList, matrixData] = await Promise.all([
        getRoles(),
        fetchPermissions(),
        fetchRolePermissions()
      ]);
      setRoles(roleList);
      setPermissions(permList);

      // Build matrix
      const m = {};
      (matrixData.assignments || []).forEach(({ role_id, permission_id }) => {
        m[role_id] = m[role_id] || new Set();
        m[role_id].add(permission_id);
      });
      setMatrix(m);
    } catch (err) {
      setSnackbarMsg(err.message || 'Failed to load RBAC matrix');
      setSnackbarOpen(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchMatrix();
    // eslint-disable-next-line
  }, []);

  const handleToggle = async (roleId, permId) => {
    const key = `${roleId}-${permId}`;
    setToggling((t) => ({ ...t, [key]: true }));

    try {
      if (matrix[roleId]?.has(permId)) {
        await removePermission(roleId, permId);
        setMatrix((m) => ({
          ...m,
          [roleId]: new Set([...m[roleId]].filter((id) => id !== permId)),
        }));
      } else {
        await assignPermission(roleId, permId);
        setMatrix((m) => ({
          ...m,
          [roleId]: new Set([...m[roleId], permId]),
        }));
        setFlash((f) => ({ ...f, [key]: true }));
        setTimeout(() => {
          setFlash((f) => ({ ...f, [key]: false }));
        }, 800);
      }
    } catch (error) {
      setSnackbarMsg(error.message || 'Failed to update permission');
      setSnackbarOpen(true);
    }
    setToggling((t) => ({ ...t, [key]: false }));
  };

  const filteredPermissions = permissions.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
        color={theme.palette.primary.main}
        textAlign="center"
      >
        RBAC Matrix — Permissions × Roles
      </Typography>

      {/* Search */}
      <Paper
        component="form"
        sx={{
          mb: 4,
          p: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: 500,
          mx: 'auto',
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <InputBase
          sx={{ ml: 1, flex: 1, color: theme.palette.text.primary }}
          placeholder="Search permissions..."
          inputProps={{ 'aria-label': 'search permissions' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton sx={{ p: '8px' }} disabled>
          <SearchIcon size={20} color={theme.palette.text.secondary} />
        </IconButton>
      </Paper>

      {/* Permissions List */}
      <Stack spacing={3}>
        {filteredPermissions.map((perm) => (
          <Card
            key={perm.id}
            variant="outlined"
            sx={{
              boxShadow: theme.shadows[1],
              borderRadius: 2,
              transition: '0.3s',
              '&:hover': { boxShadow: theme.shadows[3] },
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                title={perm.description || perm.name}
                color={theme.palette.text.primary}
              >
                {perm.name}
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  pb: 1,
                  gap: 2,
                }}
              >
                {roles.map((role) => {
                  const key = `${role.id}-${perm.id}`;
                  const checked = matrix[role.id]?.has(perm.id);
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
                          <Avatar
                            sx={{
                              mx: 'auto',
                              width: 32,
                              height: 32,
                              mb: 1,
                              bgcolor: theme.palette.primary[100] || theme.palette.primary.main,
                              fontSize: 14,
                              color: theme.palette.primary.contrastText || '#fff'
                            }}
                          >
                            {role.name[0]}
                          </Avatar>
                          <Switch
                            checked={checked}
                            onChange={() => handleToggle(role.id, perm.id)}
                            disabled={isLoading}
                            color="primary"
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

      <SnackbarAlert
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={snackbarMsg}
      />
    </Box>
  );
}