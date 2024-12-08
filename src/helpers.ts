import { CalendarComponent, VEvent } from "node-ical";
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
  const today = new Date().setHours(0, 0, 0, 0);
  const tomorrow = new Date(today + 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);

  return events.filter(({ summary, start, end }) => {
    // Only keep the events of the selected employees that start or end today
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
