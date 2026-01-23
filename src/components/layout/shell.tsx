import { type ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";

export const Shell = ({ children }: {children: ReactNode}) => {
return <Container maxWidth='5xl'>
  <Box mt={8} mb={8}>{children}</Box></Container>;
};
