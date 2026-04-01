'use client';

import { truncatedClean } from "@/utils/format";
import { Card, Heading, Box } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) => {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }

  const regex = new RegExp(
    `(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Box as="span" key={index} bg="orange.muted">
            {part}
          </Box>
        ) : (
          part
        ),
      )}
    </>
  );
};

export const ModelCard = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const truncatedDescription = truncatedClean(description, 250);
  return (
    <Card.Root
      size="md"
      height="full"
      bg="orange.subtle"
      overflow="hidden"
      _hover={{ bg: "orange.muted", borderColor: "orange.solid" }}
    >
      <Card.Header>
        <Heading color="orange.solid" size={{ base: "md", md: "lg" }}>{title}</Heading>
      </Card.Header>
      <Card.Body color="fg" fontSize={{ base: "sm", md: "initial" }} textAlign="justify">
        <ReactMarkdown
        >
          {`${truncatedDescription}...`}
        </ReactMarkdown>
      </Card.Body>
    </Card.Root>
  );
};

export const DownloadDataCard = ({
  title,
  description,
  source,
  updated,
  downloadUrl,
  highlight,
}: {
  title: string;
  description: string | undefined;
  source: string | undefined;
  updated: string;
  downloadUrl: string;
  highlight?: string;
}) => {
  const { t } = useTranslation();

  return (
    <Card.Root size="md" borderRadius={0}>
      <Card.Header>
        <Heading size="md">
          {title && <HighlightText text={title} highlight={highlight} />}
        </Heading>
      </Card.Header>

      <Card.Body color="fg.muted">
        <p>
          {description && <HighlightText text={description} highlight={highlight} />}
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          {t('downloads.source')} {source}
        </p>
        <p style={{ fontSize: "0.875rem" }}>
          {t('downloads.updated')} {new Date(updated).toLocaleDateString()}
        </p>
      </Card.Body>
      <Card.Footer>
        <a href={downloadUrl} download>
          <Box
            fontFamily="heading"
            display="flex"
            alignItems="center"
            textDecoration={"underline"}
          >
            {t('downloads.download')}
            <Box pl={2}>
              <LuDownload />
            </Box>
          </Box>
        </a>
      </Card.Footer>
    </Card.Root>
  );
};
