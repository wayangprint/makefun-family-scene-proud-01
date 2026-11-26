// One-line family scene for the make.fun proud-judge bounty.
// This script is deliberately boring: it takes three fixed pieces of a
// Sunday-morning memory, joins them into a single line, checks the line
// against the contest's length rule, and drops it into the output
// folder next to the illustration that pictures the same moment.
// There is no clock, no network, and no randomness anywhere, so every
// run writes exactly the same bytes.

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// The memory, kept as three labelled pieces so each beat of the joke
// can be read on its own: the wall, the toast, and the weekly repeat.
const memory = {
  wall: "Dad framed my first burnt pancake like a diploma",
  toast: "'First in the family to almost cook,' he said",
  encore: "and Mum still serves it every Sunday, slightly less burnt, always with applause.",
};

// The dash that separates the beats, written as an escape so the file
// never depends on an editor saving a particular glyph.
const DASH = "\u2014";

function renderScene(pieces: { wall: string; toast: string; encore: string }): string {
  return [pieces.wall, pieces.toast, pieces.encore].join(` ${DASH} `);
}

const scene = renderScene(memory);

// The gate the sealed scorer applies: one line, 1-280 characters,
// and more than blank space. Fail loudly here instead of shipping
// a file the grader would throw away.
function checkScene(text: string): void {
  const size = [...text].length;
  if (size < 1 || size > 280) {
    throw new Error(`scene must be 1-280 characters long, found ${size}`);
  }
  if (text.trim().length === 0) {
    throw new Error("scene must contain more than whitespace");
  }
}

checkScene(scene);

// The harness points at the output folder with MAKEFUN_OUTPUT_DIR;
// a hand-run falls back to the contest's /output convention.
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "entry.txt"), scene, { encoding: "utf8" });

// Read the file back and make sure the disk holds exactly the line we
// meant to ship; a silent partial write would be worse than a crash.
const writtenBack = fs.readFileSync(path.join(outDir, "entry.txt"), "utf8");
if (writtenBack !== scene) {
  throw new Error("entry.txt on disk does not match the scene");
}

// The illustration lives beside this script; hand the reader a copy
// next to the text so the picture and the line travel together.
const here = fileURLToPath(new URL(".", import.meta.url));
const picture = fs.readFileSync(path.join(here, "scene.png"));
fs.writeFileSync(path.join(outDir, "scene.png"), picture);

process.stdout.write(scene + "\n");
