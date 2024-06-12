import { async as icalAsync, sync as icalSync } from "node-ical";
import {
  getEmployeeNames,
  getEmployeesFromEvents,
  getEventsForEmployees,
} from "./helpers";

(async () => {
  try {
    if (!process.env?.CALENDAR_URL || process.env?.CALENDAR_URL === "") {
      throw new Error("CALENDAR_URL is missing");
    }

    const response =
      process.env.NODE_ENV === "test"
        ? icalSync.parseFile("example-calendar.ics")
        : await icalAsync.fromURL(process.env.CALENDAR_URL);

    const names = getEmployeeNames();

    console.info(`Looking for events for ${names.length} employees`);

    const employeeEvents = getEventsForEmployees(
      Object.values(response),
      names,
    );

    const outOfOfficeEmployees = getEmployeesFromEvents(employeeEvents);

    console.info(`${outOfOfficeEmployees.length} employees are off today`);

    return outOfOfficeEmployees;
  } catch (err: unknown) {
    console.log(err);

    process.exit(-1);
  }
})();
