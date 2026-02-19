'use client';

import { Shell } from "@/components/layout/shell";
import { DownloadList } from "./download-list";
import { useTranslation } from "react-i18next";

export default function Page() {
  const { t } = useTranslation();

  return (
    <Shell breadcrumb={[{ label: t('breadcrumbs.downloads') }]}>
      <DownloadList />
    </Shell>
  );
}
