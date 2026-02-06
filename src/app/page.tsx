import { Box, Heading, Text, Button, Image, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export default function Home() {
  return (
    <Box h="calc(100vh - 57px)" display="flex">
      <Box
        flex={1}
        display="flex"
        alignItems="center"
        bg="gray.50"
        px={{ base: 4, md: 8 }}
        py={8}
      >
        <VStack gap={6} maxW="lg" align="start">
          <Heading as="h1" size="5xl" textTransform="uppercase" fontWeight="900" lineHeight="1" letterSpacing="0.8px">
            <span style={{ fontWeight: "300" }}>Mozambique</span> <br />
            Proenergia+ IEP
          </Heading>
          <Text fontSize="lg" color="gray.600">
            A web platform for integrated energy planning and analysis in
            Mozambique. Proenergia+ IEP aims to increase access to energy and
            broadband services in project areas and strengthen the operational
            performance of the electric utility.
          </Text>
          <Box
            pt={4}
            display="flex"
            gap={4}
            flexDirection={{ base: "column", sm: "row" }}
            width="full"
          >
            <Button asChild size="lg" variant="outline">
              <NextLink href="/about">Learn More</NextLink>
            </Button>
            <Button asChild size="lg" variant="solid" colorPalette="yellow">
              <NextLink href="/models">View Models</NextLink>
            </Button>
          </Box>
        </VStack>
      </Box>
      <Box
        flex={1}
        position="relative"
        display={{ base: "none", md: "block" }}
        bg="gray.200"
      >
        <Image
          src="/landing-image1.png"
          alt="Energy infrastructure illustration"
          style={{ height: "100%", objectFit: "cover" }}
        />
      </Box>
    </Box>
  );
}
