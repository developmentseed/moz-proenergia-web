import { truncatedClean } from "@/utils/format";
import { Card, Heading, Box } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";

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
          <Box as="span" key={index} bg="yellow.muted">
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
  return (
    <Card.Root
      size="md"
      height="full"
      bg="bg.muted"
      _hover={{ bg: "yellow.subtle" }}
    >
      <Card.Header>
        <Heading size="md"> {title} </Heading>
      </Card.Header>
      <Card.Body color="fg.muted">{truncatedClean(description, 250)}...</Card.Body>
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
  description: string;
  source: string;
  updated: string;
  downloadUrl: string;
  highlight?: string;
}) => {
  return (
    <Card.Root size="md" borderRadius={0}>
      <Card.Header>
        <Heading size="md">
          <HighlightText text={title} highlight={highlight} />
        </Heading>
      </Card.Header>

      <Card.Body color="fg.muted">
        <p>
          <HighlightText text={description} highlight={highlight} />
        </p>
        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem" }}>
          Source: {source}
        </p>
        <p style={{ fontSize: "0.875rem" }}>
          Updated: {new Date(updated).toLocaleDateString()}
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
            Download
            <Box pl={2}>
              <LuDownload />
            </Box>
          </Box>
        </a>
      </Card.Footer>
    </Card.Root>
  );
};
