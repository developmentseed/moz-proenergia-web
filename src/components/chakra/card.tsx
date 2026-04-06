"use client";

import { formatIfDate, truncatedClean } from "@/utils/format";
import {
  Card,
  Heading,
  Box,
  Button,
  Tag,
  Flex,
  Text,
  DataList,
} from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { DataType } from "@/utils/data-transformation";

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
  updated,
  downloadUrl,
  highlight,
  models,
  dataType,
  item,
}: {
  title: string;
  description: string | undefined;
  source: string | undefined;
  updated: string;
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
          <Heading size="xs" color="fg.muted" mt={1}>
            {source}
          </Heading>
        )}
        {models && models.length > 0 && (
          <Flex gap={1} flexWrap="wrap" mt={2}>
            <Text
              color="fg.muted"
              fontSize="xs"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Models:
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
      </Card.Header>

      <Card.Body color="fg.muted">
        <Text fontSize="sm" mb={2}>
          {description && (
            <HighlightText text={description} highlight={highlight} />
          )}
        </Text>
        <DataList.Root
          orientation="horizontal"
          display="grid"
          gap={{ base: 2, md: 4 }}
          size="sm"
          gridTemplateColumns="repeat(auto-fill, minmax(10rem, 314px))"
        >
          {item &&
            Object.entries(item).map(
              ([key, value]: [string, string | number]) => {
                if (
                  key === "id" ||
                  key === "name" ||
                  key === "source" ||
                  key === "description" ||
                  key === "name_pt" ||
                  key === "description_pt" ||
                  key === "raw_file" ||
                  key === "is_public" ||
                  key === "is_approved" ||
                  key === "dataType" ||
                  key === "color"
                ) {
                  return null;
                }
                if (value === null || value === undefined || value === "") {
                  return null;
                }
                return (
                  <DataList.Item key={key}>
                    <DataList.ItemLabel
                      color="fg.muted"
                      fontSize="xs"
                      letterSpacing="wider"
                      textTransform="uppercase"
                    >
                      {t(key)}:
                    </DataList.ItemLabel>
                    <DataList.ItemValue fontSize="sm">
                      {String(formatIfDate(value))}
                    </DataList.ItemValue>
                  </DataList.Item>
                );
              },
            )}
        </DataList.Root>
        {dataType && (
          <Box mt={2}>
            <Tag.Root size="sm" variant="outline">
              <Tag.Label>{t(`downloads.dataType.${dataType}`)}</Tag.Label>
            </Tag.Root>
          </Box>
        )}
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
