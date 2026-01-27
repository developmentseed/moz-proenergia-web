import { Shell } from "@/components/layout/shell";
import { DownloadList } from "./download-list";

export default function Page() {
  return (
    <Shell breadcrumb={[{ label: "Downloads" }]}>
      <DownloadList />
    </Shell>
  );
}
