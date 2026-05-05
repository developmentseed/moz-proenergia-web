"use client";

import { Text, DataList, Box, Link } from "@chakra-ui/react";
import { ModalDialog } from "@/components/chakra/modal";
import { formatIfDate } from "@/utils/format";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

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

const MARKDOWN_KEYS = new Set([
  "source",
  "contact",
  "license",
  "attribute",
  "lineage",
]);

interface LayerInfoModalProps {
  title: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

export function LayerInfoModal({
  title,
  description,
  metadata,
  open,
  onOpenChange,
}: LayerInfoModalProps) {
  const { t } = useTranslation();

  const hasContent = description || metadata;

  return (
    <ModalDialog
      modalTitle={title}
      modalContent={
        <>
          {description && (
            <Box fontSize="sm" mb={4}>
              <ReactMarkdown components={mdComponents}>
                {description}
              </ReactMarkdown>
            </Box>
          )}
          {metadata && (
            <DataList.Root orientation="horizontal" size="sm" gap={3}>
              {Object.entries(metadata).map(([key, value]) => {
                if (value === null || value === undefined || value === "")
                  return null;
                const formatted = String(formatIfDate(value));
                return (
                  <DataList.Item key={key}>
                    <DataList.ItemLabel
                      color="fg.muted"
                      fontSize="xs"
                      letterSpacing="wider"
                      textTransform="uppercase"
                    >
                      {t(`metadata.${key}`, { defaultValue: key })}:
                    </DataList.ItemLabel>
                    <DataList.ItemValue fontSize="sm">
                      {MARKDOWN_KEYS.has(key) ? (
                        <ReactMarkdown components={mdComponents}>
                          {formatted}
                        </ReactMarkdown>
                      ) : (
                        formatted
                      )}
                    </DataList.ItemValue>
                  </DataList.Item>
                );
              })}
            </DataList.Root>
          )}
          {!hasContent && (
            <Text fontSize="sm" color="fg.muted" fontStyle="italic">
              {t('map.noDescription')}
            </Text>
          )}
        </>
      }
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
