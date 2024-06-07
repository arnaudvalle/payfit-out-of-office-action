/**
 * Get the list of employee names passed to the script
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
