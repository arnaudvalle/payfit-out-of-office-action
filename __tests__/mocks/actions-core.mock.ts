/**
 * @actions/core v3 is ESM-only; Jest cannot require() it. Tests map the package here
 * so spyOn/mockImplementation keep working for getInput, setOutput, setFailed, info.
 */
export const getInput = jest.fn((): string => "");
export const setFailed = jest.fn((): void => undefined);
export const setOutput = jest.fn((): void => undefined);
export const info = jest.fn((): void => undefined);
