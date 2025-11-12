import { Provider as ChakraProvider } from "@/components/ui/provider"
import Map from "@/components/map"
import { SideBar } from '@/components/sidebar'
import { Grid, GridItem, Container} from '@chakra-ui/react'
import { useSidebarState } from '@/hooks/useSidebarState'
import { rangeFilterConfigs, checkboxFilterConfigs } from '@/config/filters'

import './index.css'

function App() {
  // Initialize sidebar state at App level to share with both SideBar and Map
  const { state, actions } = useSidebarState({
    initialLayers: [],
    rangeFilters: rangeFilterConfigs,
    checkboxFilters: checkboxFilterConfigs,
    onApply: (formState) => {
      console.log('Filters applied:', formState);
    }
  });

  return (
    <ChakraProvider>
      <Container fluid p={0}>
      <Grid templateColumns="repeat(4, 1fr)" gap="6">
        <GridItem colSpan={1} p={2}><SideBar state={state} actions={actions} /></GridItem>
        <GridItem colSpan={3}><Map state={state} /></GridItem>
      </Grid>
      </Container>
    </ChakraProvider>
  )
}

export default App
