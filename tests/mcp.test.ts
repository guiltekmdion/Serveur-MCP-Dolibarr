import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import MockAdapter from 'axios-mock-adapter';
import { dolibarrClient } from '../src/services/dolibarr.js';
import { handleReadResource } from '../src/resources/index.js';
import { handleGetPrompt } from '../src/prompts/index.js';
import { AxiosInstance } from 'axios';

// Access private client
const client = (dolibarrClient as any).client as AxiosInstance;
const mock = new MockAdapter(client);

describe('MCP Features', () => {
  afterEach(() => {
    mock.reset();
  });

  describe('Resources', () => {
    it('should read recent thirdparties', async () => {
       const mockData = [{ id: '1', name: 'Test' }];
       // searchThirdParties calls /thirdparties with sqlfilters
       mock.onGet('/thirdparties').reply(200, mockData);
       
       const result = await handleReadResource('dolibarr://thirdparties/recent');
       assert.deepStrictEqual(JSON.parse(result), mockData);
    });

    it('should read open proposals', async () => {
        const mockData = [{ 
          id: '1', 
          ref: 'PROP-001', 
          status: '1',
          socid: '10',
          date: 1700000000,
          total_ht: 100,
          total_ttc: 120
        }];
        mock.onGet('/proposals').reply(200, mockData);
        
        const result = await handleReadResource('dolibarr://proposals/open');
        assert.deepStrictEqual(JSON.parse(result), mockData);
     });

     it('should throw error for unknown resource', async () => {
        await assert.rejects(
            async () => await handleReadResource('dolibarr://unknown'),
            /Resource not found/
        );
     });
  });

  describe('Prompts', () => {
     it('should generate create-commercial-proposal prompt', () => {
        const result = handleGetPrompt('create-commercial-proposal', { client_name: 'ACME', requirements: 'Stuff' });
        assert.ok(result.messages[0].content.text.includes('ACME'));
        assert.ok(result.messages[0].content.text.includes('Stuff'));
     });

     it('should generate analyze-thirdparty-situation prompt', () => {
        const result = handleGetPrompt('analyze-thirdparty-situation', { thirdparty_id: '123' });
        assert.ok(result.messages[0].content.text.includes('123'));
     });

     it('should throw error for unknown prompt', () => {
        assert.throws(
            () => handleGetPrompt('unknown-prompt'),
            /Prompt not found/
        );
     });
  });
});
