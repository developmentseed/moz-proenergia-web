"use client";

import { Text, DataList } from "@chakra-ui/react";
import { ModalDialog } from "@/components/chakra/modal";
import { formatIfDate } from "@/utils/format";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

const MARKDOWN_KEYS = new Set(["source", "contact", "license", "attribute", "lineage"]);

interface LayerInfoModalProps {
  title: string;
  description?: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
}

export function LayerInfoModal({ title, description, metadata, open, onOpenChange }: LayerInfoModalProps) {
  const { t } = useTranslation();

  const hasContent = description || metadata;

  return (
    <ModalDialog
      modalTitle={title}
      modalContent={
        <>
          {description && (
            <Text fontSize="sm" mb={4}>
              <ReactMarkdown>{description}</ReactMarkdown>
            </Text>
          )}
          {metadata && (
            <DataList.Root orientation="horizontal" size="sm" gap={3}>
              {Object.entries(metadata).map(([key, value]) => {
                if (value === null || value === undefined || value === "") return null;
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
                      {MARKDOWN_KEYS.has(key) ? <ReactMarkdown>{formatted}</ReactMarkdown> : formatted}
                    </DataList.ItemValue>
                  </DataList.Item>
                );
              })}
            </DataList.Root>
          )}
          {!hasContent && (
            <Text fontSize="sm" color="fg.muted" fontStyle="italic">
              No description available.
            </Text>
          )}
        </>
      }
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}
