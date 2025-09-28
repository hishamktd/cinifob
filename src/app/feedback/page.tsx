'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Link,
  Card,
  CardContent,
  Divider,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { MainLayout } from '@core/components/layout';
import { AppIcon } from '@core/components/app-icon';
import { useToast } from '@/hooks/useToast';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'critical';

interface FeedbackForm {
  type: FeedbackType;
  priority: Priority;
  title: string;
  description: string;
  steps?: string;
  expected?: string;
  actual?: string;
  category: string;
}

const FeedbackPage = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<FeedbackForm>({
    type: 'bug',
    priority: 'medium',
    title: '',
    description: '',
    steps: '',
    expected: '',
    actual: '',
    category: 'general',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'general',
    'movies',
    'tv-shows',
    'watchlist',
    'authentication',
    'ui-ux',
    'performance',
    'api',
    'database',
    'other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create GitHub issue body
      const issueBody = `
## Type: ${formData.type.toUpperCase()}
## Priority: ${formData.priority.toUpperCase()}
## Category: ${formData.category}

### Description
${formData.description}

${
  formData.type === 'bug'
    ? `
### Steps to Reproduce
${formData.steps || 'N/A'}

### Expected Behavior
${formData.expected || 'N/A'}

### Actual Behavior
${formData.actual || 'N/A'}
`
    : ''
}

### User Information
- User: ${session?.user?.email || 'Anonymous'}
- Submitted: ${new Date().toISOString()}
- App Version: ${process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'}
`;

      // Here you would typically send this to your backend API
      // which would then create a GitHub issue using the GitHub API
      // For now, we'll show a success message and provide a link to manually create the issue

      const githubIssueUrl = `https://github.com/hishamktd/cinifob-app/issues/new?title=${encodeURIComponent(
        formData.title,
      )}&body=${encodeURIComponent(issueBody)}&labels=${formData.type},${formData.priority}`;

      // Optional: Save to local database for tracking
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      showToast('Feedback submitted successfully!', 'success');

      // Open GitHub issue page in new tab
      window.open(githubIssueUrl, '_blank');

      // Reset form
      setFormData({
        type: 'bug',
        priority: 'medium',
        title: '',
        description: '',
        steps: '',
        expected: '',
        actual: '',
        category: 'general',
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      showToast('Failed to submit feedback. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange =
    (field: keyof FeedbackForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));
    };

  const getTypeIcon = (type: FeedbackType) => {
    switch (type) {
      case 'bug':
        return 'mdi:bug';
      case 'feature':
        return 'mdi:lightbulb';
      case 'improvement':
        return 'mdi:trending-up';
      default:
        return 'mdi:comment-text';
    }
  };

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography variant="h4" gutterBottom>
                Report Issues & Suggestions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Help us improve CiniFob by reporting bugs or suggesting new features
              </Typography>
            </Box>

            {/* Quick Links */}
            <Alert severity="info" icon={<AppIcon icon="mdi:github" />}>
              <Typography variant="body2">
                You can also track issues directly on our{' '}
                <Link
                  href="https://github.com/users/hishamktd/projects/4/views/2"
                  target="_blank"
                  rel="noopener"
                >
                  GitHub Project Board
                </Link>
              </Typography>
            </Alert>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Type and Priority */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={handleChange('type')}
                      label="Type"
                      startAdornment={
                        <Box sx={{ ml: 1, mr: 0.5, display: 'flex' }}>
                          <AppIcon icon={getTypeIcon(formData.type)} />
                        </Box>
                      }
                    >
                      <MenuItem value="bug">Bug Report</MenuItem>
                      <MenuItem value="feature">Feature Request</MenuItem>
                      <MenuItem value="improvement">Improvement</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={formData.priority}
                      onChange={handleChange('priority')}
                      label="Priority"
                    >
                      <MenuItem value="low">
                        <Chip label="Low" size="small" color="success" />
                      </MenuItem>
                      <MenuItem value="medium">
                        <Chip label="Medium" size="small" color="info" />
                      </MenuItem>
                      <MenuItem value="high">
                        <Chip label="High" size="small" color="warning" />
                      </MenuItem>
                      <MenuItem value="critical">
                        <Chip label="Critical" size="small" color="error" />
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Category */}
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={handleChange('category')}
                      label="Category"
                    >
                      {categories.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Title */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    placeholder="Brief description of the issue or suggestion"
                    required
                  />
                </Grid>

                {/* Description */}
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={handleChange('description')}
                    placeholder="Provide detailed information about your feedback"
                    required
                  />
                </Grid>

                {/* Bug-specific fields */}
                {formData.type === 'bug' && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Steps to Reproduce (Optional)"
                        value={formData.steps}
                        onChange={handleChange('steps')}
                        placeholder="1. Go to...\n2. Click on...\n3. See error"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Expected Behavior (Optional)"
                        value={formData.expected}
                        onChange={handleChange('expected')}
                        placeholder="What should happen?"
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Actual Behavior (Optional)"
                        value={formData.actual}
                        onChange={handleChange('actual')}
                        placeholder="What actually happens?"
                      />
                    </Grid>
                  </>
                )}

                {/* Submit Button */}
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                      startIcon={
                        isSubmitting ? (
                          <AppIcon icon="mdi:loading" className="animate-spin" />
                        ) : (
                          <AppIcon icon="mdi:send" />
                        )
                      }
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Additional Info */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1} alignItems="center">
                      <AppIcon icon="mdi:bug" size={32} color="error.main" />
                      <Typography variant="subtitle2">Report Bugs</Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        Found something broken? Let us know so we can fix it
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1} alignItems="center">
                      <AppIcon icon="mdi:lightbulb" size={32} color="warning.main" />
                      <Typography variant="subtitle2">Suggest Features</Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        Have ideas to make CiniFob better? We&apos;d love to hear them
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack spacing={1} alignItems="center">
                      <AppIcon icon="mdi:github" size={32} />
                      <Typography variant="subtitle2">Track Progress</Typography>
                      <Typography variant="caption" color="text.secondary" align="center">
                        Follow your issues on our GitHub project board
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Contact Alternative */}
            <Alert severity="info">
              <Typography variant="body2">
                For urgent issues or direct support, you can also email us at{' '}
                <Link href="mailto:support@cinifob.app">support@cinifob.app</Link>
              </Typography>
            </Alert>
          </Stack>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default FeedbackPage;
