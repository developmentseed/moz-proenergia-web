import { Accordion, Box, Table, Text, Flex } from "@chakra-ui/react";
import { LuChevronUp } from "react-icons/lu";
import { SummaryTableSkeleton } from "@/components/chakra/summary-table-skeleton";
import { InfoTip } from "./toggle-tip";
import { formatDisplayNumber } from "@/utils/number";
import { parseSortPrefix, stripSortPrefix } from "@/utils/string";
import { SummaryBarChart } from "@/components/chakra/chart/bar";
import { SummaryDonutChart } from "@/components/chakra/chart/pie";
import { SummaryStackedBarChart } from "@/components/chakra/chart/stacked";
import {
  type SummaryData,
  type SummaryRow,
  type SummaryItem,
  type ErrorRow,
  type FlatRow,
  type ChartRow,
  type GroupRow,
  type NestedGroupRow,
  type HighlightRow,
} from "@/app/types/summary";
import { Highlight } from "@/components/chakra/highlight";
import { useTranslation } from "react-i18next";

const formatValue = (value: string | number, hasDecimal?: boolean) => {
  //@ts-expect-error @TODO
  if (!isNaN(value)) {
    return formatDisplayNumber(value as number, hasDecimal);
  }
  return value;
};

// ─── Row style props ────────────────────────────────────────────────────────
const lastRowStyleProps = { "& > td": { borderBottom: "none" } };

const summaryRowProps = {
  bg: "panelBg",
  _last: lastRowStyleProps,
};

const sectionHeaderRowProps = {
  bg: "bg",
  borderTopColor: "border",
  borderTopWidth: "1px",
  h: "30px",
  _last: lastRowStyleProps,
};

// ─── Cell style props ───────────────────────────────────────────────────────
const tableCellStyleProps = { py: 0.5, px: 1 };

const sectionHeaderCellProps = {
  colSpan: 2,
  p: 0.5,
  borderBottomColor: "fg.muted",
};

// ─── Text style props ───────────────────────────────────────────────────────
const sectionHeaderLabelProps = {
  textStyle: "tableAttr",
  fontWeight: "bold",
  fontSize: "sm",
};

const valueTextProps = {
  textStyle: "tableValue",
  textAlign: "right" as const,
  fontFamily: "mono",
};

// ─── Layout props ───────────────────────────────────────────────────────────
const labelBoxProps = { display: "flex", alignItems: "center", gap: 1 };

// ────────────────────────────────────────────────────────────────────────────

interface SummaryTableProps {
  data: SummaryData | undefined;
  isLoading: boolean;
  isError?: boolean;
  maxHeight?: number | string;
  collapsible?: boolean;
}

function sortChartFirst(rows: SummaryRow[]): SummaryRow[] {
  return [...rows].sort((a, b) => {
    const aIsChart = a.type === "chart" || a.type === "highlight" ? 0 : 1;
    const bIsChart = b.type === "chart" || b.type === "highlight" ? 0 : 1;
    return aIsChart - bIsChart;
  });
}

function groupByCategory(
  rows: SummaryRow[],
): { category: string | null; rows: SummaryRow[] }[] {
  const map = new Map<string | null, SummaryRow[]>();
  for (const row of rows) {
    const cat = row.category || null;
    const arr = map.get(cat);
    if (arr) arr.push(row);
    else map.set(cat, [row]);
  }
  return Array.from(map, ([category, rows]) => ({ category, rows }));
}

function ErrorRowView({ row }: { row: ErrorRow }) {
  const { t } = useTranslation();
  return (
    <Table.Row key={row.key} {...summaryRowProps}>
      <Table.Cell {...tableCellStyleProps}>
        <Text textStyle="tableAttr">{row.label}</Text>
      </Table.Cell>
      <Table.Cell {...tableCellStyleProps}>
        <Text textStyle="tableValue" textAlign="right" color="fg.error">
          {t('explorer.noData')}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function FlatRowView({ row }: { row: FlatRow }) {
  const { t } = useTranslation();
  const label = row.labelKey ? t(row.labelKey, { defaultValue: row.label }) : row.label;
  const description = row.descriptionKey ? t(row.descriptionKey, { defaultValue: row.description }) : row.description;
  return (
    <Table.Row key={row.key} bg="panelBg">
      <Table.Cell {...tableCellStyleProps} p={0.5}>
        {" "}
        <Box {...labelBoxProps}>
          <Text textStyle="tableAttr">
            {label}{" "}
            <Text as="span" fontWeight="normal">
              {row.unit && `(${row.unit})`}{" "}
            </Text>
          </Text>
          {description && <InfoTip content={description} />}
        </Box>
      </Table.Cell>
      <Table.Cell {...tableCellStyleProps}>
        <Text {...valueTextProps}>
          {formatValue(row.value, row.hasDecimal)}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function MethodTotalRow({
  item,
  hasDecimal,
}: {
  item?: SummaryItem;
  hasDecimal?: boolean;
}) {
  const { t } = useTranslation();
  if (!item) return null;
  return (
    <Table.Row bg="panelBg" css={lastRowStyleProps}>
      <Table.Cell {...tableCellStyleProps} pb={4}>
        <Text textStyle="tableAttr">
          <Text as="span" fontWeight="semibold">
            {t('explorer.total')}
          </Text>{" "}
          ({item.label})
        </Text>
      </Table.Cell>
      <Table.Cell {...tableCellStyleProps} pb={4}>
        <Text {...valueTextProps} fontWeight="semibold">
          {formatValue(item.value, hasDecimal)}
        </Text>
      </Table.Cell>
    </Table.Row>
  );
}

function ChartValueRows({ row }: { row: ChartRow }) {
  return (
    <>
      {row.value.map((item) => (
        <Table.Row key={item.key} {...summaryRowProps}>
          <Table.Cell {...tableCellStyleProps}>
            <Text textStyle="tableAttr">{item.label}</Text>
          </Table.Cell>
          <Table.Cell {...tableCellStyleProps}>
            <Text {...valueTextProps}>
              {formatValue(item.value, row.hasDecimal)}
            </Text>
          </Table.Cell>
        </Table.Row>
      ))}
      <MethodTotalRow item={row.methodTotal} hasDecimal={row.hasDecimal} />
    </>
  );
}

function ChartRowView({ row }: { row: ChartRow }) {
  const { t } = useTranslation();
  const label = row.labelKey ? t(row.labelKey, { defaultValue: row.label }) : row.label;
  const description = row.descriptionKey ? t(row.descriptionKey, { defaultValue: row.description }) : row.description;
  if (!Array.isArray(row.value)) return null;
  if (row.chartType === "bar") {
    return (
      <>
        <Table.Row {...sectionHeaderRowProps}>
          <Table.Cell {...sectionHeaderCellProps}>
            <Box {...labelBoxProps}>
              <Text {...sectionHeaderLabelProps}>
                {label}
                <Text as="span" fontWeight="normal">
                  {" "}
                  {row.unit && `(${row.unit})`}
                </Text>
              </Text>
              {description && label !== description && (
                <InfoTip content={description} />
              )}
            </Box>
          </Table.Cell>
        </Table.Row>
        <Table.Row _last={lastRowStyleProps}>
          <Table.Cell colSpan={2} border="none">
            <SummaryBarChart
              data={row.value}
              average={row.showBarChartAverage ? row.average : undefined}
              colorMap={row.colorMap}
              unit={row.unit}
            />
          </Table.Cell>
        </Table.Row>
        {row.showChartValueRows !== false && <ChartValueRows row={row} />}
      </>
    );
  }
  if (row.chartType === "donut") {
    return (
      <>
        <Table.Row {...sectionHeaderRowProps}>
          <Table.Cell {...sectionHeaderCellProps}>
            <Box {...labelBoxProps}>
              <Text {...sectionHeaderLabelProps}>
                {label}
                <Text as="span" fontWeight="normal">
                  {" "}
                  {row.unit && `(${row.unit})`}
                </Text>
              </Text>
              {description && label !== description && (
                <InfoTip content={description} />
              )}
            </Box>
          </Table.Cell>
        </Table.Row>
        <Table.Row _last={lastRowStyleProps}>
          <Table.Cell colSpan={2} border="none">
            <SummaryDonutChart
              data={row.value}
              colorMap={row.colorMap}
              unit={row.unit}
            />
          </Table.Cell>
        </Table.Row>
        {row.showChartValueRows !== false && <ChartValueRows row={row} />}
      </>
    );
  }
  if (row.chartType === "stacked") {
    return (
      <>
        <Table.Row {...sectionHeaderRowProps}>
          <Table.Cell {...sectionHeaderCellProps}>
            <Box {...labelBoxProps}>
              <Text {...sectionHeaderLabelProps}>
                {label}
                <Text as="span" fontWeight="normal">
                  {" "}
                  {row.unit && `(${row.unit})`}
                </Text>
              </Text>
              {description && label !== description && (
                <InfoTip content={description} />
              )}
            </Box>
          </Table.Cell>
        </Table.Row>
        <Table.Row _last={lastRowStyleProps}>
          <Table.Cell colSpan={2} px={2} py={2}>
            <SummaryStackedBarChart
              data={row.value}
              colorMap={row.colorMap}
              unit={row.unit}
            />
          </Table.Cell>
        </Table.Row>
        {row.showChartValueRows !== false && <ChartValueRows row={row} />}
      </>
    );
  }
  return <Text>{t('explorer.onlyChartAvailable')}</Text>;
}

function GroupRowView({ row }: { row: GroupRow }) {
  const { t } = useTranslation();
  const label = row.labelKey ? t(row.labelKey, { defaultValue: row.label }) : row.label;
  const description = row.descriptionKey ? t(row.descriptionKey, { defaultValue: row.description }) : row.description;
  return (
    <>
      <Table.Row key={label + "-group-row"} {...sectionHeaderRowProps}>
        <Table.Cell {...sectionHeaderCellProps}>
          <Box {...labelBoxProps}>
            <Text {...sectionHeaderLabelProps}>
              {" "}
              {label}
              <Text as="span" fontWeight="normal">
                {" "}
                {row.unit && `(${row.unit})`}
              </Text>
            </Text>
            {description && label !== description && (
              <InfoTip content={description} />
            )}
          </Box>
        </Table.Cell>
      </Table.Row>
      {row.value.map((item) => (
        <Table.Row key={item.key} {...summaryRowProps}>
          <Table.Cell {...tableCellStyleProps}>
            <Text textStyle="tableAttr"> {item.label}</Text>
          </Table.Cell>
          <Table.Cell {...tableCellStyleProps}>
            <Text {...valueTextProps}>
              {formatValue(item.value, row.hasDecimal)}
            </Text>
          </Table.Cell>
        </Table.Row>
      ))}
      <MethodTotalRow item={row.methodTotal} hasDecimal={row.hasDecimal} />
    </>
  );
}

function NestedGroupRowView({ row }: { row: NestedGroupRow }) {
  const { t } = useTranslation();
  const label = row.labelKey ? t(row.labelKey, { defaultValue: row.label }) : row.label;
  const description = row.descriptionKey ? t(row.descriptionKey, { defaultValue: row.description }) : row.description;
  return (
    <>
      <Table.Row key={label} {...sectionHeaderRowProps}>
        <Table.Cell colSpan={2} fontWeight="bold" borderBottomColor="fg.muted">
          <Box {...labelBoxProps}>
            <Text {...sectionHeaderLabelProps}>
              {label}
              <Text as="span" fontWeight="normal">
                {" "}
                {row.unit && `(${row.unit})`}
              </Text>
            </Text>
            {description && label !== description && (
              <InfoTip content={description} />
            )}
          </Box>
        </Table.Cell>
      </Table.Row>
      {row.value.flatMap((group) => [
        <Table.Row
          key={`${row.label}-${group.key}`}
          bg="bg"
          borderTopColor="border"
          borderTopWidth="1px"
          _last={lastRowStyleProps}
        >
          <Table.Cell
            colSpan={2}
            fontWeight="semibold"
            borderBottomColor="fg.muted"
          >
            <Text textStyle="tableAttr" fontSize="sm">
              {group.label}
            </Text>
          </Table.Cell>
        </Table.Row>,
        ...group.items.map((item) => (
          <Table.Row key={`${group.key}-${item.key}`} {...summaryRowProps}>
            <Table.Cell {...tableCellStyleProps}>
              <Text textStyle="tableAttr">{item.label}</Text>
            </Table.Cell>
            <Table.Cell {...tableCellStyleProps}>
              <Text {...valueTextProps}>
                {formatValue(item.value, row.hasDecimal)}
              </Text>
            </Table.Cell>
          </Table.Row>
        )),
      ])}
      <MethodTotalRow item={row.methodTotal} hasDecimal={row.hasDecimal} />
    </>
  );
}

function HighlightRowView({ row }: { row: HighlightRow }) {
  const { t } = useTranslation();
  const label = row.labelKey ? t(row.labelKey, { defaultValue: row.label }) : row.label;
  const description = row.descriptionKey ? t(row.descriptionKey, { defaultValue: row.description }) : row.description;
  const items = row.value.map((item) => ({
    id: String(formatValue(item.value)),
    label: item.label,
  }));
  return (
    <>
      <Table.Row
        bg="bg"
        borderTopColor="border"
        borderTopWidth="1px"
        h="30px"
        _last={lastRowStyleProps}
      >
        <Table.Cell {...sectionHeaderCellProps}>
          <Box {...labelBoxProps}>
            <Text {...sectionHeaderLabelProps}>
              {label}
              <Text as="span" fontWeight="normal">
                {" "}
                {row.unit && `(${row.unit})`}
              </Text>
            </Text>
            {description && label !== description && (
              <InfoTip content={description} />
            )}
          </Box>
        </Table.Cell>
      </Table.Row>
      <Table.Row {...summaryRowProps}>
        <Table.Cell colSpan={2} px={0} border="none">
          <Highlight items={items} />
        </Table.Cell>
      </Table.Row>
    </>
  );
}

function SummaryRowView({ row }: { row: SummaryRow }) {
  switch (row.type) {
    case "error":
      return <ErrorRowView row={row} />;
    case "flat":
      return <FlatRowView row={row} />;
    case "chart":
      return <ChartRowView row={row} />;
    case "group":
      return <GroupRowView row={row} />;
    case "nested-group":
      return <NestedGroupRowView row={row} />;
    case "highlight":
      return <HighlightRowView row={row} />;
    default:
      return null;
  }
}

export const SummaryTable = ({
  data,
  isLoading,
  isError,
  maxHeight,
  collapsible = true,
}: SummaryTableProps) => {
  const { t } = useTranslation();
  const groups = data
    ? groupByCategory(data).sort((a, b) => {
        if (a.category === null) return -1;
        if (b.category === null) return 1;
        return parseSortPrefix(a.category) - parseSortPrefix(b.category);
      })
    : [];
  return (
    <Box maxHeight={maxHeight} width="100%">
      {isLoading && <SummaryTableSkeleton />}

      {!isLoading && isError && (
        <Box px={4} py={4}>
          <Text color="fg.error" textStyle="tableValue">
            {t('explorer.noData')}
          </Text>
        </Box>
      )}

      {!isLoading && !isError && data && collapsible && (() => {
        const uncategorized = groups.find((g) => g.category === null);
        const categorized = groups.filter((g) => g.category !== null) as { category: string; rows: SummaryRow[] }[];
        return (
          <>
            {uncategorized && (
              <Table.Root size="sm">
                <Table.Body>
                  {sortChartFirst(uncategorized.rows).map((row) => (
                    <SummaryRowView key={row.type === "error" || row.type === "flat" ? row.key + 'row' : row.label} row={row} />
                  ))}
                </Table.Body>
              </Table.Root>
            )}
            {categorized.length > 0 && (
              <Accordion.Root
                collapsible
                multiple
                defaultValue={categorized.length > 0 ? [categorized[0].category] : []}
                size="sm"
                variant="outline"
                lazyMount={true}
              >
                {categorized.map((group) => (
                  <Accordion.Item key={group.category} value={group.category} mx={-4}
                      px={4}>
                    <Accordion.ItemTrigger
                      display="flex"
                      gap="2"
                      alignItems="center"
                      width="100%"
                      fontSize="md"
                      fontWeight="semibold"
                    >
                      {stripSortPrefix(group.category)}
                      <Accordion.ItemIndicator ml="auto">
                        <LuChevronUp />
                      </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent pb={4}>
                      <Table.Root size="sm">
                        <Table.Body>
                          {sortChartFirst(group.rows).map((row) => (
                            <SummaryRowView key={row.type === "error" || row.type === "flat" ? row.key + 'row' : row.label} row={row} />
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            )}
          </>
        );
      })()}

      {!isLoading && !isError && data && !collapsible && (
        <Table.Root size="sm">
          <Table.Body>
            {sortChartFirst(data).map((row) => (
              <SummaryRowView key={row.type === "error" || row.type === "flat" ? row.key : row.label} row={row} />
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
};
