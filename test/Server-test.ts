import {Server} from "../";

describe('Server', () => {

  const server: Server = new Server(null, {
    baseIRI: 'http://example.org/',
    cacheDuration: 10,
    title: 'My Server',
  });

  describe('#getHeaders', () => {

    it('should handle text media types', async () => {
      expect(server.getHeaders('text/html')).toEqual({
        'Access-Control-Allow-Headers': 'Accept',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Location,Link',
        'Content-Type': 'text/html;charset=utf-8',
        'Vary': 'Accept',
      });
    });

    it('should handle other media types', async () => {
      expect(server.getHeaders('application/ld+json')).toEqual({
        'Access-Control-Allow-Headers': 'Accept',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Location,Link',
        'Content-Type': 'application/ld+json',
        'Vary': 'Accept',
      });
    });

  });

  describe('#getQuery', () => {

    it('should produce a CONSTRUCT query for a given path based on the baseIRI', async () => {
      expect(server.getQuery('my/path')).toEqual(`
CONSTRUCT {
  ?s ?p ?o
} WHERE {
  ?s ?p ?o.
  FILTER(regex(str(?s), "^http://example.org/my/path" ) )
}`);
    });

  });

});
