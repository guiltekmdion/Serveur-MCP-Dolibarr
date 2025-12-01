import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import MockAdapter from 'axios-mock-adapter';
import { dolibarrClient } from '../src/services/dolibarr.js';
import { AxiosInstance } from 'axios';

// Access private client
const client = (dolibarrClient as any).client as AxiosInstance;
const mock = new MockAdapter(client);

describe('DolibarrClient', () => {
  afterEach(() => {
    mock.reset();
  });

  it('should get third party by ID', async () => {
    const mockData = {
      id: '1',
      name: 'Test Company',
      code_client: 'C-001',
      email: 'test@example.com',
      status: '1'
    };

    mock.onGet('/thirdparties/1').reply(200, mockData);

    const result = await dolibarrClient.getThirdParty('1');
    assert.deepStrictEqual(result, mockData);
  });

  it('should handle API errors gracefully', async () => {
    mock.onGet('/thirdparties/999').reply(404, {
      error: { message: 'Not Found' }
    });

    await assert.rejects(
      async () => await dolibarrClient.getThirdParty('999'),
      /Dolibarr API Error \(404\): Ressource non trouvée/
    );
  });

  it('should search third parties', async () => {
    const mockData = [
      {
        id: '1',
        name: 'Test Company',
        code_client: 'C-001',
        email: 'test@example.com',
        status: '1'
      }
    ];

    mock.onGet('/thirdparties').reply(200, mockData);

    const result = await dolibarrClient.searchThirdParties('Test');
    assert.deepStrictEqual(result, mockData);
  });

  it('should create a third party', async () => {
    const newThirdParty = {
      name: 'New Company',
      code_client: 'C-NEW',
      client: '1' as const,
      email: 'new@example.com'
    };
    
    // Dolibarr returns the ID of the created object
    mock.onPost('/thirdparties').reply(200, '100');

    const result = await dolibarrClient.createThirdParty(newThirdParty);
    assert.strictEqual(result, '100');
  });

  it('should create a proposal', async () => {
    const proposalData = {
      socid: '1',
      date: 1700000000, // Timestamp example
      action: 'create'
    };
    
    mock.onPost('/proposals').reply(200, '200');

    const result = await dolibarrClient.createProposal(proposalData);
    assert.strictEqual(result, '200');
  });

  it('should add a line to a proposal', async () => {
    const lineData = {
      proposal_id: '200',
      desc: 'Service Test',
      subprice: 100,
      qty: 1,
      tva_tx: 20,
      fk_product: undefined,
      product_type: 1, // Service
    };

    // Note: Dolibarr utilise /line (singulier) pour ajouter UNE ligne
    mock.onPost('/proposals/200/line').reply(200, '50');

    const result = await dolibarrClient.addProposalLine(lineData);
    assert.strictEqual(result, '50');
  });

  it('should generate PDF using documents/builddoc', async () => {
    // D'abord mock la récupération de la proposition pour obtenir la ref
    mock.onGet('/proposals/7').reply(200, {
      id: '7',
      ref: 'PR2511-0001',
      socid: '1',
      status: 1,
      date: 1700000000,
    });

    // Puis mock la génération du PDF
    mock.onPut('/documents/builddoc').reply(200, {
      filename: 'PR2511-0001',
      'content-type': 'application/octet-stream',
      filesize: 4096,
      encoding: 'base64',
      content: 'JVBERi0xLjQ=', // fake base64 PDF content
    });

    const result = await dolibarrClient.generatePdf('propal', '7');
    assert.ok(result.filename);
  });

  it('should update a third party', async () => {
    const updateData = {
      id: '1',
      name: 'Updated Company',
      email: 'updated@example.com'
    };

    mock.onPut('/thirdparties/1').reply(200, updateData);

    await assert.doesNotReject(async () => {
      await dolibarrClient.updateThirdParty(updateData);
    });
  });

  it('should upload a document', async () => {
    const docData = {
      filename: 'test.txt',
      modulepart: 'proposal',
      ref: 'PR2511-0001',
      filecontent: 'base64content',
      fileencoding: 'base64' as const,
      overwrite: true
    };

    mock.onPost('/documents/upload').reply(200, 'test.txt');

    const result = await dolibarrClient.uploadDocument(docData);
    assert.strictEqual(result, 'test.txt');
  });
});
