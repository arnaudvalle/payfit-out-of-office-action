import * as core from "@actions/core";
import { beforeEach, describe, expect, it, type MockInstance, vi,
} from "vitest";
import * as main from "../src/index";
import * as helpers from "../src/helpers";

describe("action", () => {
  let getInputMock: MockInstance<typeof core.getInput>;
  let setFailedMock: MockInstance<typeof core.setFailed>;
  let setOutputMock: MockInstance<typeof core.setOutput>;
  let getEventsForEmployeesMock: MockInstance<typeof helpers.getEventsForEmployees>;
  let getEmployeesFromEventsMock: MockInstance<typeof helpers.getEmployeesFromEvents>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the GitHub Actions core library
    getInputMock = vi.spyOn(core, "getInput").mockImplementation(() => "");
    setFailedMock = vi.spyOn(core, "setFailed").mockImplementation(() => {});
    setOutputMock = vi.spyOn(core, "setOutput").mockImplementation(() => {});
    getEventsForEmployeesMock = vi.spyOn(helpers, "getEventsForEmployees").mockImplementation(() => []);
    getEmployeesFromEventsMock = vi.spyOn(helpers, "getEmployeesFromEvents").mockImplementation(() => []);
  });

  it("errors if calendar_url is missing", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "";
        case "names":
          return "Geralt OF RIVIA";
        default:
          return "";
      }
    });

    await main.run();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Missing calendar_url or names input",
    );
  });

  it("errors if names are missing", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "https://some.url/calendar.ics";
        case "names":
          return "";
        default:
          return "";
      }
    });

    await main.run();

    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      "Missing calendar_url or names input",
    );
  });

  it("returns early if there are no events in the ical", async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name) => {
      switch (name) {
        case "calendar_url":
          return "./__tests__/__fixtures__/example-calendar-empty.ics";
        case "names":
          return "Geralt OF RIVIA";
        default:
          return "";
      }
    });

    await main.run();

    expect(setOutputMock).toHaveBeenNthCalledWith(1, "names", []);
    expect(getEventsForEmployeesMock).not.toHaveBeenCalled();
    expect(getEmployeesFromEventsMock).not.toHaveBeenCalled();
  });
});
