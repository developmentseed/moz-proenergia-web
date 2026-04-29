'use client';

import { Component, type ReactNode } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="full"
          width="full"
          gap={3}
          p={4}
          textAlign="center"
        >
          <Text fontSize="sm" color="fg.muted">
            {this.state.error?.message ?? 'Something went wrong.'}
          </Text>
          <Button size="xs" variant="outline" onClick={this.reset}>
            Try again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
