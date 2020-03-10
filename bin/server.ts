#!/usr/bin/env node
import {newEngine} from "@comunica/actor-init-sparql";
import {readFileSync} from "fs";
import {join} from "path";
import {Server} from "../";

// Validate args
if (process.argv.length !== 3) {
  process.stderr.write(`Missing config file.\n`);
  process.stderr.write(`Usage:\n`);
  process.stderr.write(`  linked-data-describer config.json\n`);
  process.exit(1);
}

// Start server
const context = JSON.parse(readFileSync(join(process.cwd(), process.argv[2]), 'utf8'));
const server = new Server(newEngine(), context);
server.start(context.port || 8080);
