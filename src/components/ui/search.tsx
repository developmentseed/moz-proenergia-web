import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

interface SearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Search = ({
  value,
  onChange,
  placeholder = "Search...",
}: SearchProps) => {
  return (
    <InputGroup endElement={<LuSearch />}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        size="md"
        width="100%"
      />
    </InputGroup>
  );
};
