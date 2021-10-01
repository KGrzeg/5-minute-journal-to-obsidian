import { readFile, writeFile } from 'fs/promises';
import { resolve, join } from 'path';
import { EOL } from 'os';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const section_blacklist = [
  'user'
];

const argv = yargs(hideBin(process.argv))
  .option('input_file', {
    alias: 'i',
    type: "string",
    default: "data.json"
  })
  .option('output_directory', {
    alias: 'o',
    type: "string",
    default: "output/"
  })
  .argv;

function toTitleCase(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPharse(term) {
  const phrases = {
    "gratitude": "I am grateful for",
    "greatness": "What will I do to make today great",
    "affirmation": "Daily affirmations",
    "amazingness": "3 Amazing things that happened today",
    "improvements": "How could I have made today even better",
  };

  if (phrases[term])
    return phrases[term];

  console.warn(`Undefined phrase, plz add "${term}" to the dictionary.`)
  return toTitleCase(term);
}

function renderMarkdownList(items, indent = 0, order = false, cbAfterItem = null) {
  let output = "";
  const ind = ("  ").repeat(indent);

  items.forEach((item, i) => {
    let startLine = ind;
    if (order)
      startLine = `${ind}- ${i + 1}. `;
    else
      startLine = `${ind}- `;

    output += `${startLine}${item}${EOL}`;

    if (cbAfterItem) {
      output += cbAfterItem(i, item);
    }
  });

  return output;
}

async function readJson(path) {
  const content = await readFile(path, 'utf8');
  return JSON.parse(content);
}

function renderContent(content) {
  let output = "";

  content.sections.forEach(section => {
    if (section_blacklist.indexOf(section.type) !== -1)
      return;

    const sectionLabel = toTitleCase(section.type);

    output += `# ${sectionLabel}${EOL}`;
    output += `- [[5 Minute Journal]]${EOL}`;
    output += `  - ${sectionLabel}::${EOL}`;

    const itemLabels = section.items.map(item => getPharse(item.type) + "::");
    const itemContents = section.items.map(item => item.content.text);

    output += renderMarkdownList(itemLabels, 2, false, itemIndex => {
      return itemContents[itemIndex] ?
        renderMarkdownList(itemContents[itemIndex], 3, true) : "";
    });

    output += EOL;
  });

  return output;
}

function renderMedia(media) {
  let output = "    - Photo of the day::" + EOL;
  const items = media
    .filter(m => m.type == "image")
    .map((m, i) => `![fotulka_${i + 1}](${m.file})${EOL}`);

  output += renderMarkdownList(items, 3, false);

  return output;
}

async function processSingleRecord(record, outputDirectory) {
  const outputPath = join(outputDirectory, `${record.date}.md`);
  let content = renderContent(record.content);

  if (record.media)
    content += renderMedia(record.media);

  await writeFile(outputPath, content, 'utf8');
  console.log(`Write to file ${outputPath}`);
}

async function processData(inputFile, outputDirectory) {
  const data = await readJson(inputFile);
  const promises = [];

  data.records.forEach(record => {
    const prom = processSingleRecord(record, outputDirectory);
    promises.push(prom);
  });

  return Promise.all(promises);
}

async function main() {
  const input = resolve(argv.input_file);
  const output = resolve(argv.output_directory);

  console.log(`Read from ${input}`);
  console.log(`Save to ${output}`);

  await processData(input, output);
  console.log("Done");
}

main();
