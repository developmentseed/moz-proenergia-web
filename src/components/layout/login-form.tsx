'use client';

import { useState } from 'react';
import {
  Box,
  Stack,
  Input,
  Button,
  Text,
  Link,
  Flex,
  Field,
} from '@chakra-ui/react';

interface LoginModalProps {
  onSubmit?: (email: string, password: string) => void | Promise<void>;
  onClose?: () => void;
}

export const LoginModalContent = ({ onSubmit, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        await onSubmit(email, password);
      }
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={4}>
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
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <Flex justify="space-between" align="center">
            <Link
              href="/forgot-password"
              fontSize="sm"
              color="blue.600"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot password?
            </Link>
          </Flex>

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
