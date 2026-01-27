import { Fragment } from "react";
import { Breadcrumb } from "@chakra-ui/react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbNav = ({ items }: BreadcrumbNavProps) => {
  return (
    <Breadcrumb.Root mb={4}>
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label} >
              <Breadcrumb.Separator />
              <Breadcrumb.Item >
                {isLast || !item.href ? (
                  <Breadcrumb.CurrentLink>{item.label}</Breadcrumb.CurrentLink>
              ) : (
                <Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
              )}
              </Breadcrumb.Item>
            </Fragment>
          );
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  );
};

export default BreadcrumbNav;
