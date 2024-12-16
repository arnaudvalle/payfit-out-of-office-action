import { CalendarComponent, DateWithTimeZone, VEvent } from "node-ical";
import * as core from "@actions/core";

const PREFIX = "Absence - ";

/**
 * Filter all the events for the given employees for today.
 */
export const getEventsForEmployees = (
  events: VEvent[],
  employeeNames: string[],
) => {
  // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
  core.info(`Looking for events for ${employeeNames.length} employees`);

  // All events summary seem to be made up of this prefix + fullname 🤷
  const allowedSummaries = employeeNames.map(
    (fullname) => `${PREFIX}${fullname}`,
  );
  const now = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()));
  const today = now.getTime();
  const tomorrow = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() + 1)).getTime();

  return events.filter(({ summary, start, end }) => {
    // Only keep the events of the selected employees that start today or end tomorrow
    // Note: the end date is always +1 day
    // Ex: if I'm off only today for a full day, then the end date will be tomorrow
    if (
      allowedSummaries.includes(summary) &&
      (start.getTime() === today ||
        end.getTime() === tomorrow ||
        (start.getTime() <= today && end.getTime() >= tomorrow))
    ) {
      return true;
    }

    return false;
  });
};

/**
 * Get a list of unique employees names based on a given list of events.
 */
export const getEmployeesFromEvents = (employeeEvents: VEvent[]) => {
  // Highly unlikely but we may have 2 events on the same day for the same person
  // (1 half-day in the morning and another in the afternoon)
  const uniqueEventNames = [
    ...new Set(employeeEvents.map(({ summary }) => summary)),
  ];

  const outOfOfficeEmployees = uniqueEventNames.map((summary) =>
    summary.replace(PREFIX, ""),
  );

  core.info(`${outOfOfficeEmployees.length} employees are off today`);

  return outOfOfficeEmployees;
};

/**
 * Adjust the event times to UTC.
 */
export const adjustEventTimesToUTC = (events: VEvent[]) => {
  return events.map(event => {
    return {
      ...event,
      start: new Date(Date.UTC(event.start.getFullYear(), event.start.getMonth(), event.start.getDate())) as DateWithTimeZone,
      end: new Date(Date.UTC(event.end.getFullYear(), event.end.getMonth(), event.end.getDate())) as DateWithTimeZone,
    }
  })
}
