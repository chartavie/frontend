import React, { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

function AdminDashboard({ navigate }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">User Management</Typography>
            <Typography>Total users: 120</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/users')}>Go to Users</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Venue Overview</Typography>
            <Typography>Active venues: 7</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/venues')}>Manage Venues</Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">System Logs</Typography>
            <Typography>Last login: 2025-06-30 09:00:00</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>View Logs</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function OrganizerDashboard({ navigate }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Organizer Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">My Events</Typography>
            <Typography>Upcoming: 3 | Past: 12</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>View Events</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Ticket Sales</Typography>
            <Typography>This month: 420 tickets</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>View Sales</Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Manage Venue Sections</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/venue-sections')}>Go to Venue Sections</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

function PublicDashboard({ navigate }) {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Upcoming Events</Typography>
            <Typography>3 events this week</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>Browse Events</Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">Popular Venues</Typography>
            <Typography>Check out trending venues!</Typography>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/venues')}>View Venues</Button>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6">My Tickets</Typography>
            <Typography>You have 2 active tickets</Typography>
            <Button variant="outlined" sx={{ mt: 2 }}>View My Tickets</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const role =
    user?.roles?.includes("admin")
      ? "admin"
      : user?.roles?.includes("organizer")
        ? "organizer"
        : "public";

  return (
    <Box>
      {role === "admin" && <AdminDashboard navigate={navigate} />}
      {role === "organizer" && <OrganizerDashboard navigate={navigate} />}
      {role === "public" && <PublicDashboard navigate={navigate} />}
    </Box>
  );
}