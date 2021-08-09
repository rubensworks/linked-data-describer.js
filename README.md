# Linked Data Describer

[![Build status](https://github.com/rubensworks/linked-data-describer.js/workflows/CI/badge.svg)](https://github.com/rubensworks/linked-data-describer.js/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/rubensworks/linked-data-describer.js/badge.svg?branch=master)](https://coveralls.io/github/rubensworks/linked-data-describer.js?branch=master)
[![npm version](https://badge.fury.io/js/linked-data-describer.svg)](https://www.npmjs.com/package/linked-data-describer)

Linked Data Describer is a tool that allows you to set up a Web service
for automatically serving Linked Data documents (_a.k.a. subject pages_) based on one or more RDF sources.

This tool automatically takes care of content negotiation as HTML and popular RDF serializations.

A live example of this tool is available at [ESWC 2020](https://metadata.2020.eswc-conferences.org/). 

## 1. Install

This server requires [Node.js](http://nodejs.org/) 10.0 or higher and is tested on OSX and Linux. To install, execute:

```bash
$ npm install -g linked-data-describer
```

## 2. Configure

Before the server can be started, a configuration file needs to be created.
For example, `config.json` could look as follows:
```bash
{
  "sources": [
    "http://mysource.example.org/document.ttl",
    "http://somesparqlendpoint.example.org/sparql",
  ],
  "port": 8080,
  "baseIRI": "https://mydomain.example.org/",
  "title": "My App",
  "prefixes": [
    "http://xmlns.com/foaf/0.1/",
    "http://www.w3.org/ns/earl#",
    "http://purl.org/dc/terms/",
    "http://purl.org/ontology/bibo/"
  ],
  "footer": "Generated with <a href=\"https://github.com/rubensworks/linked-data-describer.js\">Linked Data Describer</a>"
}
```

Config entries:
* `sources`: An array of RDF sources, this can be an RDF document in any serialization, a SPARQL endpoint, or a [Triple Pattern Fragments](http://www.hydra-cg.com/spec/latest/triple-pattern-fragments/) interface (any source that is accepted by [Comunica](https://github.com/comunica/comunica) is allowed).
* `port`: The local TCP port at which the server should be started.
* `baseIRI`: The base IRI at which the server is hosted. This should also correspond to the base IRI of the subjects that are to be described by this service.
* `title`: The title that will appear in HTML.
* `prefixes`: An array of IRI prefixes that will be shortened in the HTML view.
* `footer`: An optional footer that can be displayed on each HTML page.

## 3. Start the server

```bash
$ linked-data-describer config.json
Server is running on https://mydomain.example.org/ (internally: http://localhost:8080/)
```

## License
This software is written by [Ruben Taelman](http://rubensworks.net/).

This code is released under the [MIT license](http://opensource.org/licenses/MIT).
