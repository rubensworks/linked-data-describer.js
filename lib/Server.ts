import {ActorInitSparql} from "@comunica/actor-init-sparql/lib/ActorInitSparql-browser";
import {readFileSync} from "fs";
import {createServer, IncomingMessage, OutgoingHttpHeaders, Server as HttpServer, ServerResponse} from "http";
import {getType as lookupMime} from "mime";
import {join} from "path";
import {parse as parseUrl, resolve} from "url";

/**
 * A server for hosting Linked Data documents that can be found within configured RDF sources.
 */
export class Server {

  private readonly engine: ActorInitSparql;
  private readonly context: any;
  private readonly baseIRI: string;
  private readonly cacheDuration: number;
  private readonly htmlView: string;

  private httpServer: HttpServer;

  constructor(engine: ActorInitSparql, context: any) {
    this.engine = engine;
    this.context = context;
    this.baseIRI = context.baseIRI;
    this.cacheDuration = context.cacheDuration;
    this.htmlView = readFileSync(join(__dirname, '../assets/', 'view.html'), 'utf8')
      .replace(/__TITLE__/, context.title)
      .replace(/__PREFIXES__/, JSON.stringify(context.prefixes));
  }

  /**
   * Start the server at the given port.
   * @param port A TCP port.
   */
  public async start(port: number) {
    // Only allow one instantiation at a time.
    if (this.httpServer) {
      throw new Error('Server is already started');
    }

    // Determine the allowed media types for requests
    const mediaTypes: {[id: string]: number} = await this.engine.getResultMediaTypes(null);
    const mediaTypeVariants: { type: string, quality: number }[] = [
      { type: 'text/html', quality: 1 }, // Set HTML as default
    ];
    for (const type of Object.keys(mediaTypes)) {
      mediaTypeVariants.push({ type, quality: mediaTypes[type] });
    }

    this.httpServer = createServer((request, response) => {
      this.constructResponse(request, response, mediaTypeVariants)
        .catch((error) => {
          response.writeHead(500);
          response.end(`Internal Server Error\n${error}\n`);
        });
    });
    this.httpServer.listen(port);

    process.stdout.write(`Server is running on ${this.baseIRI} (internally: http://localhost:${port}/)\n`);

    this.setClearCacheTimer();
  }

  public getHeaders(mediaType: string): OutgoingHttpHeaders {
    return {
      'Content-Type': mediaType.indexOf('text/') ? mediaType : mediaType + ';charset=utf-8',
    };
  }

  public getQuery(path: string): string {
    if (path === '/') {
      return `
CONSTRUCT {
  ?s ?p ?o
} WHERE {
  ?s ?p ?o.
  FILTER(regex(str(?s), "^${this.baseIRI}" ) )
}`;
    }
    const url = resolve(this.baseIRI, path);
    return `DESCRIBE <${url}>`;
  }

  /**
   * Construct a response for a given request.
   * @param request An HTTP request to read from.
   * @param response An HTTP response to write to.
   * @param mediaTypeVariants All available media types.
   */
  public async constructResponse(request: IncomingMessage, response: ServerResponse,
                                 mediaTypeVariants: { type: string, quality: number }[]) {
    // First check for an assets request
    const { path } = parseUrl(request.url);
    if (path.startsWith('/assets')) {
      const filePath = path.replace(/^\/assets/, join(__dirname, '../assets'));
      response.writeHead(200, this.getHeaders(lookupMime(filePath)));
      response.end(readFileSync(filePath));
      return;
    }

    // Validate HTTP method
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405);
      response.end(`Method Not Allowed\nThis server only supports GET and HEAD requests\n`);
      return;
    }

    // Determine the appropriate media type
    const acceptedMediaTypes = require('negotiate').choose(mediaTypeVariants, request);
    if (acceptedMediaTypes.length === 0) {
      response.writeHead(406);
      response.end(`Not Acceptable\nThis server only supports the media types: ${Object.keys(mediaTypeVariants)}\n`);
      return;
    }
    const mediaType: string = acceptedMediaTypes[0].type;
    const headers = this.getHeaders(mediaType);

    // Stop further processing on HEAD requests
    if (request.method === 'HEAD') {
      response.writeHead(200, headers);
      response.end();
      return;
    }

    // Return HTML view
    if (mediaType === 'text/html') {
      response.writeHead(200, headers);
      response.end(this.htmlView);
      return;
    }

    // Execute query
    const result = await this.engine.query(this.getQuery(path), this.context);

    // Serialize to proper format
    const { data } = await this.engine.resultToString(result, 'application/trig', result.context);
    response.writeHead(200, headers);
    data.pipe(response);
  }

  private setClearCacheTimer() {
    setTimeout(() => {
      this.engine.invalidateHttpCache();
      this.setClearCacheTimer();
    }, this.cacheDuration);
  }
}
