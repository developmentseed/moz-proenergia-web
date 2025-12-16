import { For, SimpleGrid, Tabs } from "@chakra-ui/react"


const Tab = ({ items }) => {
  return (
    <Tabs.Root
      defaultValue={items[0].id}
      width='full'
      variant="plain"
      css={{
        "--tabs-indicator-bg": "colors.gray.subtle",
        "--tabs-indicator-shadow": "shadows.xs",
        "--tabs-trigger-radius": "radii.full",
      }}
    >
      <Tabs.List>
        {items.map(item => <Tabs.Trigger key={item.id} value={item.id}>{item.label}</Tabs.Trigger>)}
        <Tabs.Indicator />
      </Tabs.List>
      {items.map(item => <Tabs.Content key={item.id} value={item.id}><item.Component {...item.componentProps} /></Tabs.Content>)}
    </Tabs.Root>
  )
}

export { Tab }