import Link from 'next/link';
import { promises as fs } from 'fs';
import { SimpleGrid, Box, Heading, Container } from "@chakra-ui/react";
import { type ModelGroupMetadata } from '@/app/types';

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/src/app/mock/models/data.json', 'utf8');
  const models = JSON.parse(file) as ModelGroupMetadata[];
  return (
    <Container>
      <SimpleGrid columns={3} padding={2}>
        {models.map(e =>
          <Link key={e.id} href ={`/model/${e.id}`}>
            <Box>
              <Heading>{e.name}</Heading>
              <p>{e.description} </p>
            </Box>
          </Link>
      )}
      </SimpleGrid>
    </Container>
  );
}
