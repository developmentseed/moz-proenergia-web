import { Card, Heading } from "@chakra-ui/react";

export const ModelCard = ({ title, description }: { title: string, description: string}) => {
  return <Card.Root size="md">
    <Card.Header>
      <Heading size="md"> {title} </Heading>
    </Card.Header>
    <Card.Body color="fg.muted">
      {description}
    </Card.Body>
  </Card.Root>;

};