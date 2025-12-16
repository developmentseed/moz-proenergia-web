import { Group, RadioCard } from "@chakra-ui/react"


const RadioOptions = ({ title, items }) => {
  console.log(items);
  return (
    <RadioCard.Root defaultValue={items[0].id} gap="4" maxW="sm">
      <RadioCard.Label>{title}</RadioCard.Label>
      <Group attached orientation="vertical">
        {items.map((item) => (
          <RadioCard.Item key={item.id} value={item.id} width="full">
            <RadioCard.ItemHiddenInput />
            <RadioCard.ItemControl>
              <RadioCard.ItemIndicator />
              <RadioCard.ItemContent>
                <RadioCard.ItemText>{item.label}</RadioCard.ItemText>
                <RadioCard.ItemDescription>
                  {item.description}
                </RadioCard.ItemDescription>
              </RadioCard.ItemContent>
            </RadioCard.ItemControl>
          </RadioCard.Item>
        ))}
      </Group>
    </RadioCard.Root>
  )
}

export { RadioOptions }