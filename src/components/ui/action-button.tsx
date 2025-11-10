import { Button } from "@chakra-ui/react"

interface ActionButtonProps {
  onClick?: () => void;
  label?: string;
}

export const ActionButton = ({ onClick, label = "Apply Filters" }: ActionButtonProps) => {
  return <Button onClick={onClick}>{label}</Button>
}