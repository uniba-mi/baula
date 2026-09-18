// Creates the English translation file if it does not exist yet.
// An existing file is never overwritten; new or removed messages have to be
// merged into messages.en.xlf explicitly.

const fs = require("fs");
const path = require("path");

const localeDir = path.join(__dirname, "..", "frontend", "src", "locale");
const source = path.join(localeDir, "messages.xlf");
const target = path.join(localeDir, "messages.en.xlf");

if (fs.existsSync(target)) {
  console.log(
    `messages.en.xlf existiert bereits und wird nicht überschrieben.\n` +
      `Neue Messages aus messages.xlf bitte gezielt übernehmen, damit vorhandene ` +
      `Übersetzungen erhalten bleiben.`
  );
  process.exit(0);
}

const content = fs
  .readFileSync(source, "utf8")
  .replace(
    /<file source-language="de"(?! target-language)/,
    '<file source-language="de" target-language="en-US"'
  );

fs.writeFileSync(target, content, "utf8");
console.log("messages.en.xlf wurde aus messages.xlf angelegt.");
