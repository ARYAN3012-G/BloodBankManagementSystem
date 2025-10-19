import React from 'react';
import { Box, Skeleton, Grid, Card, CardContent } from '@mui/material';

export const TableSkeleton: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
    ))}
  </Box>
);

export const CardSkeleton: React.FC = () => (
  <Grid container spacing={3}>
    {[1, 2, 3, 4].map((i) => (
      <Grid item xs={12} sm={6} md={3} key={i}>
        <Card>
          <CardContent>
            <Skeleton variant="text" width="60%" height={30} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
);

export const FormSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
    <Skeleton variant="rectangular" height={48} width="200px" />
  </Box>
);

export const DashboardSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="text" width="30%" height={50} sx={{ mb: 4 }} />
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} sm={4} key={i}>
          <Skeleton variant="rectangular" height={120} />
        </Grid>
      ))}
    </Grid>
    <Skeleton variant="rectangular" height={400} />
  </Box>
);
