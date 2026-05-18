import { type ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";
import { BreadcrumbNav, BreadcrumbItem } from "@/components/chakra/";

interface ShellProps {
  children: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  maxW?: string;
}

export const Shell = ({ children, breadcrumb, maxW }: ShellProps) => {
  return (
    <Container maxW={maxW ?? "8xl"}>
      <Box pt={8} pb={8}>
        {breadcrumb && <BreadcrumbNav items={breadcrumb} />}
        {children}
      </Box>
    </Container>
  );
};
