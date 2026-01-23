import { type ReactNode } from "react";
import { Container, Heading, Text, Box } from "@chakra-ui/react";
import AboutContent from './about.mdx';

interface ChildrenType {
  children: ReactNode
}

function H1({ children }: ChildrenType) {
  return <Heading as='h1' mb={2}>{children}</Heading>;
}

function H2({ children }: ChildrenType) {
  return <Heading as='h2' mb={2}>{children}</Heading>;
}

function H3({ children }: ChildrenType) {
  return <Heading as='h3' mb={2}>{children}</Heading>;
}

function Paragraph ({ children }: ChildrenType) {
  return <Text mb={4}>{children}</Text>;
}

const overrideComponents = {
  h2: H2,
  h3: H3,
  p: Paragraph
};

export default function Page() {
  return <Container>
    <Box mt={8} mb={8}>
      <AboutContent components={overrideComponents} />
    </Box>
  </Container>;
}