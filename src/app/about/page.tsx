"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Shell } from "@/components/layout/shell";
import { Text, Heading, List, Link as ChakraLink } from "@chakra-ui/react";
import AboutContentEn from "./about.mdx";
import AboutContentPt from "./about.pt.mdx";

interface ChildrenType {
  children: ReactNode;
}

function H1({ children }: ChildrenType) {
  return (
    <Heading as="h1" size="3xl" mb={2}>
      {children}
    </Heading>
  );
}

function H2({ children }: ChildrenType) {
  return (
    <Heading as="h2" size="2xl" mb={2} pt={3}>
      {children}
    </Heading>
  );
}

function H3({ children }: ChildrenType) {
  return (
    <Heading as="h3" size="xl" mb={2} pt={2}>
      {children}
    </Heading>
  );
}

function Paragraph({ children }: ChildrenType) {
  return <Text textAlign="justify" mb={4} lineHeight="normal">{children}</Text>;
}

function UL({ children }: ChildrenType) {
  return (
    <List.Root mb={4} ml={4}>
      {children}
    </List.Root>
  );
}

function LI({ children }: ChildrenType) {
  return <List.Item mb={1}>{children}</List.Item>;
}

function Link({ children, href }: { children: ReactNode; href: string }) {
  return (
    <ChakraLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      color="orange.500"
      textDecoration="underline"
    >
      {children}
    </ChakraLink>
  );
}

const overrideComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: Paragraph,
  ul: UL,
  li: LI,
  a: Link,
};

export default function Page() {
  const { t, i18n } = useTranslation();
  const Content = i18n.language?.startsWith("pt")
    ? AboutContentPt
    : AboutContentEn;

  return (
    <Shell breadcrumb={[{ label: t("breadcrumbs.about") }]} maxW="4xl">
      <Content components={overrideComponents} />
    </Shell>
  );
}
