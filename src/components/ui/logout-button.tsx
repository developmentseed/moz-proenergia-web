'use client';

import { useState, useEffect } from 'react';
import { Button, Text } from '@chakra-ui/react';
import { useAuth } from '@/utils/context/auth';

interface LogoutButtonProps {
  onLogoutStart?: () => void;
  onLogoutEnd?: () => void;
}

export const LogoutButton = ({ onLogoutStart, onLogoutEnd }: LogoutButtonProps) => {
  const { logout } = useAuth();
  const [justLoggedOut, setJustLoggedOut] = useState(false);

  useEffect(() => {
    if (!justLoggedOut) return;
    const timer = setTimeout(() => {
      setJustLoggedOut(false);
      onLogoutEnd?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [justLoggedOut, onLogoutEnd]);

  const handleLogout = () => {
    onLogoutStart?.();
    logout();
    setJustLoggedOut(true);
  };

  if (justLoggedOut) {
    return (
      <Text fontSize="sm" fontWeight="medium" color="green.600">
        Log out successful
      </Text>
    );
  }

  return (
    <Button
      variant="plain"
      padding={0}
      fontSize="sm"
      fontWeight="medium"
      color="fg.muted"
      onClick={handleLogout}
    >
      Log out
    </Button>
  );
};

export default LogoutButton;
