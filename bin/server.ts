#!/usr/bin/env node
import {newEngine} from "@comunica/actor-init-sparql";
import {Server} from "../";

const context = { sources: ['https://data.linkeddatafragments.org/eswc2020'] };
const server = new Server(newEngine(), context);
server.start(8080);
