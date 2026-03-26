export const EVENT_BOOKING_SOURCE_EVENTS = "events" as const;
export const EVENT_BOOKING_SOURCE_SOLO = "solo_events" as const;

export type EventBookingSource =
  | typeof EVENT_BOOKING_SOURCE_EVENTS
  | typeof EVENT_BOOKING_SOURCE_SOLO;

export type EventBookingRow = {
  id: string;
  userId: string;
  eventId: string;
  source: string;
  createdAt: number;
};
