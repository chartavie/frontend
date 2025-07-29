import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Card, CardContent, Dialog, DialogTitle, DialogContent,
  Stack, IconButton, Tooltip, Button, List, ListItem, ListItemText, Divider, TextField, DialogActions
} from "@mui/material";
import { EditIcon, DeleteIcon } from '../Shared/Icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { getRoles, createRole, removeRole } from '../services/roleService';
import SnackbarAlert from '../Shared/SnackbarAlert';

export default function Roles() {
  const { theme } = useContext(ThemeContext);
  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '' });
  const [editId, setEditId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles();
        setRoles(rolesData);
      } catch (err) {
        setSnackbarMsg(err.message);
        setSnackbarOpen(true);
      }
    };
    fetchRoles();
  }, []);

  const handleOpen = (role = null) => {
    setForm({ name: role?.name || '' });
    setEditId(role?.id || null);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    try {
      if (editId) {
        // You can implement updateRole here if needed
      } else {
        await createRole(form.name);
      }
      setOpen(false);
      setEditId(null);
      setRoles(await getRoles());
    } catch (err) {
      setSnackbarMsg(err.message);
      setSnackbarOpen(true);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await removeRole(deleteId);
      setRoles(await getRoles());
    } catch (err) {
      setSnackbarMsg(err.message);
      setSnackbarOpen(true);
    } finally {
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">Roles</Typography>
        <Button variant="contained" onClick={() => handleOpen(null)}>
          Add Role
        </Button>
      </Box>

      <Card sx={{ boxShadow: 2, width: "100%", maxWidth: 600, mx: "auto" }}>
        <CardContent>
          {roles.length === 0 ? (
            <Typography>No roles found.</Typography>
          ) : (
            <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
              {roles.map((role, idx) => (
                <React.Fragment key={role.id}>
                  <ListItem
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(role)}
                          >
                            <EditIcon size={18} color={theme.palette.text.primary} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(role.id)}
                          >
                            <DeleteIcon size={18} color={theme.palette.text.primary} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  >
                    <ListItemText primary={role.name} />
                  </ListItem>
                  {idx < roles.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Role" : "Add Role"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{editId ? "Update" : "Create"}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete Role</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this role?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <SnackbarAlert
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        severity="error"
        message={snackbarMsg}
      />
    </Box>
  );
}