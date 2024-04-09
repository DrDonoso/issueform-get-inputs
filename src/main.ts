import * as core from "@actions/core";

function processKey(processKey: string): string {
  processKey = processKey.trim();

  processKey = processKey.replace(/ /g, "_");

  processKey = processKey.toLowerCase();

  return processKey;
}

function processCheckboxLine(body: string, checkboxLine: string): void {
  console.log(`checkboxLine: ${checkboxLine}`);
  const option = checkboxLine.replace(/- \[[^\]]*\] /, "");

  const key = processKey(option);
  console.log(`key: ${key}`);
  const value = checkboxLine.includes("- [X]") ? "true" : "false";
  console.log(`🔑 Setting output: ${key} = ${value}`);
  core.setOutput(`${key}`, `${value}`);

  const currentIndex = body.indexOf(checkboxLine);
  const nextCheckboxIndex = body.indexOf(
    "- [",
    currentIndex + checkboxLine.length,
  );

  if (nextCheckboxIndex !== -1) {
    const bodySubstring = body.substring(nextCheckboxIndex);
    const match = bodySubstring.match(/- \[[^\]]*\] .*/);
    if (match) {
      const nextCheckboxLine = match[0];
      processCheckboxLine(body, nextCheckboxLine);
    }
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const body: string = core.getInput("body");
    console.log(`BODY: ${body}`);
    const lines = body.split("\n");

    lines.forEach((line) => {
      console.log(`Line: ${line}`);
      if (line.startsWith("###")) {
        console.log(`🔍 Processing line: ${line}`);
        const value = lines[lines.indexOf(line) + 2];
        console.log(`   🔍 Found value: ${value}`);

        if (value.startsWith("- [")) {
          console.log("☑️ Detected a checkbox!");
          processCheckboxLine(body, value);
        } else {
          const key = line.replace("###", "").trim();

          const processedKey = processKey(key);
          console.log(`🔑 Setting output: ${processedKey} = ${value}`);
          core.setOutput(`${processedKey}`, `${value}`);
        }
      }
    });
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}
