import { CalendarComponent, VEvent } from "node-ical";

/**
 * Get the list of employee names passed to the script.
 */
export const getEmployeeNames = () => {
  // The first two args are node & path to script so skip them
  const args = process.argv.slice(2);

  // No arguments
  if (args.length < 1) {
    throw new Error("No arguments");
  }

  const namesArgValue = args.find((arg) => arg.startsWith("names="));

  if (!namesArgValue) {
    throw new Error('Missing "names" argument');
  }

  return namesArgValue.split("=")[1].split(",");
};

/**
 * Filter all the events for the given employees for today.
 */
export const getEventsForEmployees = (
  events: CalendarComponent[],
  employeeNames: string[],
) => {
  // We can ignore VTimeZone and VCalendar for now
  const vevents = events.filter(
    (component): component is VEvent => component.type === "VEVENT",
  );

  // Don't bother going any further if there aren't any actual events
  if (vevents.length === 0) {
    console.info("No events found");
    return [];
  }

  console.info(
    `Found a total of ${vevents.length} events in the provided ical`,
  );

  const allowedSummaries = employeeNames.map(
    (fullname) => `Absence - ${fullname}`,
  );
  const today = new Date().setHours(0, 0, 0, 0);

  return vevents.filter(({ summary, start, end }) => {
    // Only keep the events of the selected employees that start or end today
    if (
      allowedSummaries.includes(summary) &&
      (start.getTime() === today || end.getTime() === today)
    ) {
      return true;
    }

    return false;
  });
};
