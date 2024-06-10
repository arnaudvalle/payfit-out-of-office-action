import { async as icalAsync } from "node-ical";
import { getEmployeeNames, getEventsForEmployees } from "./helpers";

(async () => {
  try {
    if (!process.env?.CALENDAR_URL || process.env?.CALENDAR_URL === "") {
      throw new Error("CALENDAR_URL is missing");
    }

    const response = await icalAsync.fromURL(process.env.CALENDAR_URL);

    const names = getEmployeeNames();

    const employeeEvents = getEventsForEmployees(
      Object.values(response),
      names,
    );

    console.log(
      "All events",
      employeeEvents.map(({ summary }) => summary),
    );
  } catch (err: unknown) {
    console.log(err);

    process.exit(-1);
  }
})();
