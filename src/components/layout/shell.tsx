import { type ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";
import { BreadcrumbNav, BreadcrumbItem } from "@/components/chakra/";

interface ShellProps {
  children: ReactNode;
  breadcrumb?: BreadcrumbItem[];
}

export const Shell = ({ children, breadcrumb }: ShellProps) => {
  return (
    <Container>
      <Box pt={8} pb={8}>
        {breadcrumb && <BreadcrumbNav items={breadcrumb} />}
        {children}
      </Box>
    </Container>
  );
};
