import * as core from "@actions/core";
import * as main from "../src/index";
import * as helpers from "../src/helpers";

// jest.mock("@actions/core");

// Mock the GitHub Actions core library
let getInputMock: jest.SpiedFunction<typeof core.getInput>;
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>;
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>;
let getEventsForEmployeesMock: jest.SpiedFunction<
  typeof helpers.getEventsForEmployees
>;
let getEmployeesFromEventsMock: jest.SpiedFunction<
  typeof helpers.getEmployeesFromEvents
>;

describe("action", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getInputMock = jest.spyOn(core, "getInput").mockImplementation();
    setFailedMock = jest.spyOn(core, "setFailed").mockImplementation();
    setOutputMock = jest.spyOn(core, "setOutput").mockImplementation();
    getEventsForEmployeesMock = jest
      .spyOn(helpers, "getEventsForEmployees")
      .mockImplementation();
    getEmployeesFromEventsMock = jest
      .spyOn(helpers, "getEmployeesFromEvents")
      .mockImplementation();
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
