"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Shell } from "@/components/layout/shell";
import { Text, Heading } from "@chakra-ui/react";
import AboutContentEn from "./about.mdx";
import AboutContentPt from "./about.pt.mdx";

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
  const { t, i18n } = useTranslation();
  const Content = i18n.language?.startsWith("pt") ? AboutContentPt : AboutContentEn;

  return (
    <Shell breadcrumb={[{ label: t("breadcrumbs.about") }]}>
      <Content components={overrideComponents} />
    </Shell>
  );
}