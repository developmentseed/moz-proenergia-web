import { IconButton } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";

interface DownloadButtonProps {
  url: string;
  label?: string;
}

export const DownloadButton = ({ url, label = "Download" }: DownloadButtonProps) => {
  return (
    <a href={url} download>
      <IconButton
        aria-label={label}
        variant="ghost"
        size="xs"
    >
        <LuDownload />
      </IconButton>
    </a>
  );
};

export default DownloadButton;
