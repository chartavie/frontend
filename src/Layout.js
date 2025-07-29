import React from "react";
import { Box, Container } from "@mui/material";

export default function Layout({ children }) {
  return (
    <Box minHeight="100vh" sx={{ pt: { xs: 8, sm: 10 }, bgcolor: "background.default" }}>
      <Container maxWidth="md">
        {children}
      </Container>
    </Box>
  );
}