'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Text,
  Field,
} from '@chakra-ui/react';
import { LoginResponse } from '@/utils/context/auth';

interface LoginModalProps {
  onSubmit?: (username: string, password: string) => void | Promise<LoginResponse>;
  onClose?: () => void;
}

export const LoginModalContent = ({ onSubmit, onClose }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [success, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(username, password);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box p={4} fontFamily={'body'} textAlign="center">
        <Box bg="green.50" color="green.700" p={4} borderRadius="md">
          <Text fontWeight="bold" fontSize="md">Login successful!</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={4} fontFamily={'body'}>
      <form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Sign in to access your account
          </Text>

          {error && (
            <Box
              bg="red.50"
              color="red.600"
              p={3}
              borderRadius="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          <Field.Root>
            <Field.Label>Username</Field.Label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field.Root>

          {/* <Flex justify="space-between" align="center">
            <Link
              href="/forgot-password"
              fontSize="sm"
              color="blue.600"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot password?
            </Link>
          </Flex> */}

          <Button
            type="submit"
            colorScheme="blue"
            width="100%"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

        </Stack>
      </form>
    </Box>
  );
};

export default LoginModalContent;
