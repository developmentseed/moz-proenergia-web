"use client";

import { formatIfDate, truncatedClean } from "@/utils/format";
import {
  Card,
  Heading,
  Box,
  Button,
  Link,
  Tag,
  Flex,
  Text,
  DataList,
} from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { DataType } from "@/utils/data-transformation";

const mdComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      color="blue.500"
      textDecoration="underline"
    >
      {children}
    </Link>
  ),
};
const dataTypeColors: Record<DataType, string> = {
  vector: "green",
  raster: "blue",
  reference: "purple",
};

const HighlightText = ({
  text,
  highlight,
}: {
  text: string;
  highlight?: string;
}) => {
  if (!highlight || !highlight.trim()) {
    return <ReactMarkdown components={mdComponents}>{text}</ReactMarkdown>;
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
          <ReactMarkdown components={mdComponents}>{part}</ReactMarkdown>
        ),
      )}
    </>
  );
};

const NotDisplayKeys = [
  "id",
  "name",
  "source",
  "description",
  "name_pt",
  "description_pt",
  "raw_file",
  "is_public",
  "is_approved",
  "dataType",
  "color",
];

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
        <Heading color="orange.solid" size={{ base: "md", md: "lg" }}>
          {title}
        </Heading>
      </Card.Header>
      <Card.Body
        color="fg"
        fontSize={{ base: "sm", md: "initial" }}
        textAlign="justify"
      >
        <ReactMarkdown>{`${truncatedDescription}...`}</ReactMarkdown>
      </Card.Body>
    </Card.Root>
  );
};

export const DownloadDataCard = ({
  title,
  description,
  source,
  downloadUrl,
  highlight,
  models,
  dataType,
  item,
}: {
  title: string;
  description: string | undefined;
  source: string | undefined;
  downloadUrl: string;
  highlight?: string;
  models?: string[];
  dataType?: DataType;
  item: object;
}) => {
  const { t } = useTranslation();

  return (
    <Card.Root size="md" borderRadius={0}>
      <Card.Header>
        <Heading size={{ base: "lg", md: "xl" }}>
          {title && <HighlightText text={title} highlight={highlight} />}
        </Heading>
        {source && (
          <Flex gap={1} align="baseline">
            <Text
              color="fg.muted"
              opacity="0.8"
              fontSize="xs"
              letterSpacing="wide"
              textTransform="uppercase"
              minW={12}
              mr={1}
            >
              {t('downloads.source')}
            </Text>
            <Heading size="sm" color="fg.muted" fontWeight="bold">
              {source}
            </Heading>
          </Flex>
        )}
        {models && models.length > 0 && (
          <Flex gap={1} flexWrap="wrap">
            <Text
              color="fg.muted"
              opacity="0.8"
              fontSize="xs"
              letterSpacing="wide"
              textTransform="uppercase"
              minW={12}
            >
              Models
            </Text>
            {models.map((m) => (
              <Tag.Root
                key={m}
                size="sm"
                colorPalette="orange"
                variant="surface"
              >
                <Tag.Label>{m}</Tag.Label>
              </Tag.Root>
            ))}
          </Flex>
        )}
        {dataType && (
          <Flex gap={1} align="center">
            <Text
              color="fg.muted"
              opacity="0.8"
              fontSize="xs"
              letterSpacing="wide"
              textTransform="uppercase"
              minW={12}
            >
              Type
            </Text>
            <Tag.Root
              size="sm"
              variant="surface"
              colorPalette={dataTypeColors[dataType]}
            >
              <Tag.Label>{t(`downloads.dataType.${dataType}`)}</Tag.Label>
            </Tag.Root>
          </Flex>
        )}
      </Card.Header>

      <Card.Body color="fg.muted" py={3}>
        {description && (
          <Text fontSize="sm" mb={4}>
            <HighlightText text={description} highlight={highlight} />
          </Text>
        )}
        <DataList.Root
          display="grid"
          gap={{ base: 2, lg: 4 }}
          size="sm"
          gridTemplateColumns="repeat(auto-fill, minmax(20rem, 1fr))"
        >
          {item &&
            Object.entries(item).map(
              ([key, value]: [string, string | number]) => {
                if (NotDisplayKeys.includes(key)) {
                  return null;
                }
                if (value === null || value === undefined || value === "") {
                  return null;
                }
                return (
                  <DataList.Item key={key}>
                    <DataList.ItemLabel
                      color="fg.muted"
                      opacity="0.8"
                      fontSize="xs"
                      letterSpacing="wide"
                      textTransform="uppercase"
                    >
                      {t(`metadata.${key}`, { defaultValue: key })}
                    </DataList.ItemLabel>
                    <DataList.ItemValue fontSize="sm">
                      {String(formatIfDate(value))}
                    </DataList.ItemValue>
                  </DataList.Item>
                );
              },
            )}
        </DataList.Root>
      </Card.Body>
      <Card.Footer>
        <Button asChild variant="outline" colorPalette="orange" size="xs">
          <a href={downloadUrl} download>
            {t("downloads.download")}
            <LuDownload />
          </a>
        </Button>
      </Card.Footer>
    </Card.Root>
  );
};
