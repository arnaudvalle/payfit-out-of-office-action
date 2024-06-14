import { async as icalAsync, sync as icalSync } from "node-ical";
import * as core from "@actions/core";
import { getEmployeesFromEvents, getEventsForEmployees } from "./helpers";

(async (): Promise<void> => {
  try {
    const calendarUrl = core.getInput("calendar_url");
    const names = core.getInput("names");

    if (!calendarUrl || calendarUrl === "") {
      core.error("calendar_url is missing");
    }

    if (!names || names === "") {
      core.error("names is missing");
    }

    const response =
      process.env.NODE_ENV === "test"
        ? icalSync.parseFile("example-calendar.ics")
        : await icalAsync.fromURL(calendarUrl);

    // Get the list of employee names passed to the action
    const fullNames = names.split(",");

    const employeeEvents = getEventsForEmployees(
      Object.values(response),
      fullNames,
    );

    const outOfOfficeEmployees = getEmployeesFromEvents(employeeEvents);

    // Set outputs for other workflow steps to use
    core.setOutput("names", outOfOfficeEmployees.join(","));
  } catch (err: unknown) {
    // Fail the workflow run if an error occurs
    if (err instanceof Error) {
      core.setFailed(err.message);
    }
  }
})();
