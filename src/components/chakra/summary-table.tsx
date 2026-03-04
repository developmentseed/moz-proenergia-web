import {
  Accordion,
  Box,
  Table,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { LuChevronUp } from "react-icons/lu";
import { InfoTip } from "./toggle-tip";
import { formatDisplayNumber } from "@/utils/number";
import { SummaryBarChart } from "@/components/chakra/chart/bar";
import { SummaryDonutChart } from "@/components/chakra/chart/pie";
import { SummaryStackedBarChart } from "@/components/chakra/chart/stacked";
import {
  type SummaryData,
  type SummaryRow,
  type ErrorRow,
  type FlatRow,
  type ChartRow,
  type GroupRow,
  type NestedGroupRow,
} from "@/app/types/summary";

const formatValue = (value: string | number, column?: string) => {
  //@ts-expect-error @TODO
  if (!isNaN(value)) return formatDisplayNumber(value as number, column);
  else return value;
};

const tableCellStyleProps = {
  py: 1,
  px: 4,
};

interface SummaryTableProps {
  data: SummaryData | undefined;
  isLoading: boolean;
  isError?: boolean;
  maxHeight?: number | string;
  collapsible?: boolean;
}

const FALLBACK_CATEGORY = "etc.";

function groupByCategory(rows: SummaryRow[]): { category: string; rows: SummaryRow[] }[] {
  const map = new Map<string, SummaryRow[]>();
  for (const row of rows) {
    const cat = row.category || FALLBACK_CATEGORY;
    const arr = map.get(cat);
    if (arr) arr.push(row);
    else map.set(cat, [row]);
  }
  return Array.from(map, ([category, rows]) => ({ category, rows }));
}

function ErrorRowView({ row }: { row: ErrorRow }) {
  return (
    <Table.Row key={row.key} bg="panelBg">
      <Table.Cell {...tableCellStyleProps}>
        <Text textStyle="tableAttr">{row.label}</Text>
      </Table.Cell>
      <Table.Cell {...tableCellStyleProps}>
        <Text textStyle="tableValue" textAlign="right" color="fg.error">
          error
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function FlatRowView({ row }: { row: FlatRow }) {
  return (
    <Table.Row key={row.key} bg="panelBg">
      <Table.Cell {...tableCellStyleProps}>
        {" "}
        <Box display="flex" alignItems="center" gap={1}>
          <Text textStyle="tableAttr">
            {row.label}{" "}
            <Text as="span" fontWeight="normal">
              {row.unit && `(${row.unit})`}{" "}
            </Text>
          </Text>
          {row.description && (
            <InfoTip content={row.description} />
          )}
        </Box>
      </Table.Cell>
      <Table.Cell {...tableCellStyleProps}>
        <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
          {formatValue(row.value, row.key)}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function ChartValueRows({ row }: { row: ChartRow }) {
  return (
    <>
      <Table.Row bg="gray.200">
        <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
          <Box display="flex" alignItems="center" gap={1}>
            <Text textStyle="tableAttr">
              {row.description || row.label}
              <Text as="span" fontWeight="normal">
                {" "}{row.unit && `(${row.unit})`}
              </Text>
            </Text>
            {row.description && row.label !== row.description && (
              <InfoTip content={row.description} />
            )}
          </Box>
        </Table.Cell>
      </Table.Row>
      {row.value.map((item) => (
        <Table.Row key={item.key} bg="panelBg">
          <Table.Cell {...tableCellStyleProps} pl={6}>
            <Text textStyle="tableAttr" pt={1} pb={1}>{item.label}</Text>
          </Table.Cell>
          <Table.Cell {...tableCellStyleProps}>
            <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
              {formatValue(item.value, item.key)}
            </Text>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  );
}

function ChartRowView({ row }: { row: ChartRow }) {
  if (row.chartType === "bar") {
    return (
      <>
        <ChartValueRows row={row} />
        <Table.Row>
          <Table.Cell colSpan={2} px={2} py={2}>
            <SummaryBarChart data={row.value} average={row.average} colorMap={row.colorMap} unit={row.unit} />
          </Table.Cell>
        </Table.Row>
      </>
    );
  }
  if (row.chartType === "donut") {
    return (
      <>
        <ChartValueRows row={row} />
        <Table.Row>
          <Table.Cell colSpan={2} px={2} py={2}>
            <SummaryDonutChart data={row.value} colorMap={row.colorMap} unit={row.unit} />
          </Table.Cell>
        </Table.Row>
      </>
    );
  }
  if (row.chartType === "stacked") {
    return (
      <>
        <ChartValueRows row={row} />
        <Table.Row>
          <Table.Cell colSpan={2} px={2} py={2}>
            <SummaryStackedBarChart data={row.value} colorMap={row.colorMap} unit={row.unit} />
          </Table.Cell>
        </Table.Row>
      </>
    );
  }
  return <Text> Only Bar Chart is available.</Text>;
}

function GroupRowView({ row }: { row: GroupRow }) {
  return (
    <>
      <Table.Row key={row.label + '-group-row'} bg="gray.200">
        <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
          <Box display="flex" alignItems="center" gap={1}>
            {/* group type should have description as label */}
            <Text textStyle="tableAttr">
              {" "}
              {row.description || row.label}
              <Text as="span" fontWeight="normal">
                {" "}
                {row.unit && `(${row.unit})`}
              </Text>
            </Text>
          </Box>
        </Table.Cell>
      </Table.Row>
      {row.value.map((item) => (
        <Table.Row key={item.key} bg="panelBg">
          <Table.Cell {...tableCellStyleProps} pl={6}>
            <Text textStyle="tableAttr" pt={1} pb={1}>
              {" "}
              {item.label}
            </Text>
          </Table.Cell>
          <Table.Cell {...tableCellStyleProps}>
            <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
              {formatValue(item.value, item.key)}
            </Text>
          </Table.Cell>
        </Table.Row>
      ))}
    </>
  );
}

function NestedGroupRowView({ row }: { row: NestedGroupRow }) {
  return (
    <>
      <Table.Row key={row.label} bg="gray.200">
        <Table.Cell px={2} py={2} colSpan={2} fontWeight="bold">
          <Box display="flex" alignItems="center" gap={1}>
            <Text textStyle="tableAttr">
              {row.description || row.label}
              <Text as="span" fontWeight="normal">
                {" "}
                {row.unit && `(${row.unit})`}
              </Text>
            </Text>
          </Box>
        </Table.Cell>
      </Table.Row>
      {row.value.flatMap((group) => [
        <Table.Row key={`${row.label}-${group.key}`} bg="gray.100">
          <Table.Cell pl={4} py={1} colSpan={2} fontWeight="semibold">
            <Text textStyle="tableAttr" fontSize="sm">{group.label}</Text>
          </Table.Cell>
        </Table.Row>,
        ...group.items.map((item) => (
          <Table.Row key={`${group.key}-${item.key}`} bg="panelBg">
            <Table.Cell {...tableCellStyleProps} pl={8}>
              <Text textStyle="tableAttr" pt={1} pb={1}>
                {item.label}
              </Text>
            </Table.Cell>
            <Table.Cell {...tableCellStyleProps}>
              <Text textStyle="tableValue" textAlign="right" fontFamily="mono">
                {formatValue(item.value, item.key)}
              </Text>
            </Table.Cell>
          </Table.Row>
        )),
      ])}
    </>
  );
}

function SummaryRowView({ row }: { row: SummaryRow }) {
  switch (row.type) {
    case "error": return <ErrorRowView row={row} />;
    case "flat": return <FlatRowView row={row} />;
    case "chart": return <ChartRowView row={row} />;
    case "group": return <GroupRowView row={row} />;
    case "nested-group": return <NestedGroupRowView row={row} />;
    default: return null;
  }
}

export const SummaryTable = ({ data, isLoading, isError, maxHeight, collapsible = true }: SummaryTableProps) => {
  const groups = data ? groupByCategory(data) : [];

  return (
    <Box maxHeight={maxHeight} width="100%" overflowY="auto" py={4}>
      {isLoading && (
        <Box display="flex" alignItems="center" justifyContent="center" py={8}>
          <Spinner size="xl" />
        </Box>
      )}

      {!isLoading && isError && (
        <Box px={4} py={4}>
          <Text color="fg.error" textStyle="tableValue">
            Failed to load data.
          </Text>
        </Box>
      )}

      {!isLoading && !isError && data && collapsible && (
        <Accordion.Root
          collapsible
          multiple
          defaultValue={groups.map((g) => g.category)}
          size="sm"
          variant="plain"
        >
          {groups.map((group) => (
            <Accordion.Item key={group.category} value={group.category}>
              <Accordion.ItemTrigger
                display="flex"
                gap="2"
                alignItems="center"
                width="100%"
                textStyle="collapsibleGroupTitle"
              >
                {group.category}
                <Accordion.ItemIndicator ml="auto">
                  <LuChevronUp />
                </Accordion.ItemIndicator>
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Table.Root size="sm">
                  <Table.Body>
                    {group.rows.map((row) => (
                      <SummaryRowView key={row.type === "error" || row.type === "flat" ? row.key + 'row': row.label} row={row} />
                    ))}
                  </Table.Body>
                </Table.Root>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      )}

      {!isLoading && !isError && data && !collapsible && (
        <Table.Root size="sm">
          <Table.Body>
            {data.map((row) => (
              <SummaryRowView key={row.type === "error" || row.type === "flat" ? row.key : row.label} row={row} />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};
