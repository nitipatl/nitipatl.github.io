#!/usr/bin/env node
// Build races.json (the site's data file) from a Google Calendar events dump.
//
// Usage:  node scripts/build-races.mjs [dumpPath] [outPath]
//   dumpPath : JSON from the Calendar MCP list_events call — either the raw
//              response object ({events:[...]}) or a bare array. Default:
//              scripts/calendar-dump.json
//   outPath  : where to write races.json. Default: races.json (repo root)
//
// The daily Claude job pulls the "running" calendar via the Calendar MCP tool,
// writes it to the dump path, then runs this script and commits races.json if
// it changed. No network, no deps — pure transform so it's deterministic/testable.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const dumpPath = process.argv[2] || join(__dirname, "calendar-dump.json");
const outPath = process.argv[3] || join(repoRoot, "races.json");
const overridesPath = join(__dirname, "race-overrides.json");

const OWNER = "iamsvz@gmail.com";
const INTL_KW = ["malaysia", "kuala lumpur", "japan", "osaka", "kanazawa", "tokyo",
  "china", "beijing", "chengdu", "singapore", "korea", "seoul", "hong kong",
  "vietnam", "taiwan", "indonesia", "jakarta", "laos"];

function detectIntl(name, loc) {
  const s = (name + " " + loc).toLowerCase();
  return INTL_KW.some((k) => s.indexOf(k) >= 0);
}

// Trim a raw Google address down to something short enough for a card.
function cleanLoc(raw) {
  if (!raw) return "";
  let s = String(raw).split("\n")[0];
  s = s.replace(/\s*\b\d{4,6}\b/g, ""); // drop postal codes
  let parts = s.split(",").map((p) => p.trim()).filter(Boolean);
  parts = parts.filter((p) => !/^(thailand|ประเทศไทย)$/i.test(p));
  if (parts.length > 2) parts = parts.slice(0, 2);
  return parts.join(", ");
}

function ownerStatus(ev) {
  if ((ev.status || "").toLowerCase() === "cancelled") return "declined";
  const me = (ev.attendees || []).find((a) => a.email === OWNER);
  const rs = me && (me.responseStatus || "").toLowerCase();
  if (rs === "declined") return "declined";
  if (rs === "needsaction" || rs === "tentative") return "pending";
  return "confirmed";
}

function load(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  const rawDump = load(dumpPath);
  const events = Array.isArray(rawDump) ? rawDump : (rawDump.events || []);
  const overrides = existsSync(overridesPath) ? load(overridesPath) : {};

  const out = [];
  for (const ev of events) {
    const name = (ev.summary || "").trim();
    const start = ev.start && (ev.start.date || ev.start.dateTime);
    if (!name || !start) continue;
    const date = String(start).slice(0, 10); // YYYY-MM-DD (local date as given)

    const ov = overrides[name] || {};
    const loc = ov.loc != null ? ov.loc : cleanLoc(ev.location);
    const status = ov.status != null ? ov.status : ownerStatus(ev);
    const intl = ov.intl != null ? !!ov.intl : detectIntl(name, loc);
    const desc = (ev.description || "").trim();

    out.push({ name, date, loc, desc, intl, status });
  }

  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  const payload = {
    generated: new Date().toISOString(),
    source: "google-calendar:running",
    count: out.length,
    events: out,
  };
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n");

  const intlN = out.filter((e) => e.intl).length;
  const pendN = out.filter((e) => e.status === "pending").length;
  const declN = out.filter((e) => e.status === "declined").length;
  console.log(`Wrote ${outPath}: ${out.length} events (intl ${intlN}, pending ${pendN}, declined ${declN}).`);
}

main();
