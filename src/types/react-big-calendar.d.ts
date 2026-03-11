declare module "react-big-calendar" {
  import { ComponentType } from "react";
  export const Calendar: ComponentType<Record<string, unknown>>;
  export function dateFnsLocalizer(config: Record<string, unknown>): unknown;
}
