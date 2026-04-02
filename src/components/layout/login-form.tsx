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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      setError(t('auth.login.validationError'));
      return;
    }
    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(username, password);
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.error', 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Box p={4} fontFamily={'body'} textAlign="center">
        <Box bg="green.50" color="green.700" p={4} borderRadius="md">
          <Text fontWeight="bold" fontSize="md">{t('auth.login.success')}</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box p={4} fontFamily={'body'}>
      <form onSubmit={handleSubmit}>
        <Stack gap={4}>
          <Text fontSize="sm" color="fg" mb={2}>
            {t('auth.login.description')}
          </Text>

          {error && (
            <Box
              bg="red.50"
              color="red.solid"
              p={3}
              borderRadius="md"
              fontSize="sm"
            >
              {error}
            </Box>
          )}

          <Field.Root>
            <Field.Label>{t('auth.login.username')}</Field.Label>
            <Input
              type="text"
              placeholder={t('auth.login.usernamePlaceholder')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>{t('auth.login.password')}</Field.Label>
            <Input
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
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
            {isLoading ? t('auth.login.submitting') : t('auth.login.submit')}
          </Button>

        </Stack>
      </form>
    </Box>
  );
};

export default LoginModalContent;
