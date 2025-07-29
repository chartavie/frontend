import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { getUsers, getRoles as getUserRoles } from '../services/userService';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper,
  TablePagination, IconButton, Chip
} from '@mui/material';
import { AddIcon } from '../Shared/Icons'; 
import AssignRolesDialog from '../components/RBAC/AssignRolesDialog';
import SnackbarAlert from '../Shared/SnackbarAlert';

export default function UsersPage() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [rolesMap, setRolesMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Assign dialog (stub)
  const [assignDialog, setAssignDialog] = useState({ open: false, user: null });

  useEffect(() => {
    if (token) {
      setLoading(true);
      getUsers(token)
        .then(async usersList => {
          setUsers(usersList);

          // Fetch roles for each user
          const rolesData = await Promise.all(usersList.map(async (user) => {
            try {
              const roles = await getUserRoles(user.id, token);
              return [user.id, roles.map(r => r.name).join(', ') || 'No roles assigned'];
            } catch (err) {
              return [user.id, 'Failed to load roles'];
            }
          }));
          setRolesMap(Object.fromEntries(rolesData));
        })
        .catch(err => {
          setSnackbar({ open: true, message: err.message, severity: 'error' });
        })
        .finally(() => setLoading(false));
    }
  }, [token, assignDialog.open]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" mb={2}>All Users</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Assign</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(u => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.status || 'Unknown'}
                        color={
                          u.status === 'active'
                            ? 'success'
                            : u.status === 'inactive'
                            ? 'default'
                            : 'warning'
                        }
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{rolesMap[u.id] || 'Loading...'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => setAssignDialog({ open: true, user: u })}
                        size="large"
                        aria-label="Assign roles"
                      >
                        <AddIcon size={22} />
                      </IconButton>
                    </TableCell>
                    <TableCell>{u.created_at ? new Date(u.created_at).toLocaleString() : ''}</TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={users.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
      <AssignRolesDialog
        open={assignDialog.open}
        onClose={(success) => {
          setAssignDialog({ open: false, user: null });
          if (success === true) {
            setSnackbar({ open: true, message: "Roles assigned successfully", severity: "success" });
          } else if (success === false) {
            setSnackbar({ open: true, message: "Failed to assign roles", severity: "error" });
          }
        }}
        user={assignDialog.user}
      />
      <SnackbarAlert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        message={snackbar.message}
      />
    </Box>
  );
}