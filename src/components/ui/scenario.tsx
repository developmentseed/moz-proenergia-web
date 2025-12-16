import { Select } from '@/components/chakra/';

const Scenario = ({ scenarios, onChange }) => {
  return <Select items={scenarios} onChange={onChange} />
}

export { Scenario }