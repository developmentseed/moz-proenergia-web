import { useState } from 'react'
import { Provider as ChakraProvider } from "@/components/ui/provider"
import Map from "@/components/map"
import { SideBar } from '@/components/sidebar'
import { Grid, GridItem, Container} from '@chakra-ui/react'
import './index.css'

function App() {
  return (
    <ChakraProvider>
      <Container fluid p={0}>
      <Grid templateColumns="repeat(4, 1fr)" gap="6">
        <GridItem colSpan={1} p={2}><SideBar/></GridItem>
        <GridItem colSpan={3}><Map /></GridItem>
      </Grid>
      </Container>
    </ChakraProvider>
  )
}

export default App
