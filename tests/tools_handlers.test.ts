import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert';
import MockAdapter from 'axios-mock-adapter';
import { dolibarrClient } from '../src/services/dolibarr.js';
import { AxiosInstance } from 'axios';

// Import handlers to test
import * as Warehouses from '../src/tools/warehouses.js';
import * as Stock from '../src/tools/stock.js';
import * as Shipments from '../src/tools/shipments.js';
import * as Contracts from '../src/tools/contracts.js';
import * as Tickets from '../src/tools/tickets.js';
import * as ExpenseReports from '../src/tools/expensereports.js';
import * as Interventions from '../src/tools/interventions.js';
import * as Advanced from '../src/tools/advanced.js';

// Access private client
const client = (dolibarrClient as any).client as AxiosInstance;
const mock = new MockAdapter(client);

describe('MCP Tool Handlers Tests', () => {
  afterEach(() => {
    mock.reset();
  });

  // === WAREHOUSES ===
  describe('Warehouses Tools', () => {
    it('handleCreateWarehouse should post to /warehouses', async () => {
      mock.onPost('/warehouses').reply(200, '100');
      const result = await Warehouses.handleCreateWarehouse({ label: 'Test Warehouse', status: '1' });
      assert.ok(JSON.stringify(result).includes('100'));
    });

    it('handleListWarehouses should get /warehouses', async () => {
      mock.onGet('/warehouses').reply(200, [{ id: '1', label: 'W1' }]);
      const result = await Warehouses.handleListWarehouses({ limit: 10 });
      assert.ok(JSON.stringify(result).includes('W1'));
    });

    it('handleUpdateWarehouse should put to /warehouses/{id}', async () => {
      mock.onPut('/warehouses/1').reply(200, {});
      const result = await Warehouses.handleUpdateWarehouse({ id: '1', label: 'Updated W' });
      assert.ok(JSON.stringify(result).includes('mis à jour'));
    });

    it('handleDeleteWarehouse should delete /warehouses/{id}', async () => {
      mock.onDelete('/warehouses/1').reply(200, {});
      const result = await Warehouses.handleDeleteWarehouse({ id: '1' });
      assert.ok(JSON.stringify(result).includes('supprimé'));
    });
  });

  // === STOCK ===
  describe('Stock Tools', () => {
    it('handleCreateStockMovement should post to /stockmovements', async () => {
      mock.onPost('/stockmovements').reply(200, '50');
      const result = await Stock.handleCreateStockMovement({ 
        product_id: '1', 
        warehouse_id: '1', 
        qty: 10,
        label: 'Test Move' // Added label as it might be required or optional
      });
      assert.ok(JSON.stringify(result).includes('50'));
    });

    it('handleTransferStock should post to /stockmovements with dest', async () => {
      mock.onPost('/stockmovements').reply(200, '51');
      const result = await Stock.handleTransferStock({ 
        product_id: '1', 
        from_warehouse_id: '1', 
        to_warehouse_id: '2',
        qty: 5
      });
      assert.ok(JSON.stringify(result).includes('effectué'));
    });
  });

  // === SHIPMENTS ===
  describe('Shipments Tools', () => {
    it('handleCreateShipment should post to /shipments', async () => {
      mock.onPost('/shipments').reply(200, '200');
      const result = await Shipments.handleCreateShipment({ socid: '1', origin_id: '10' });
      assert.ok(JSON.stringify(result).includes('200'));
    });

    it('handleCloseShipment should post to /shipments/{id}/close', async () => {
      mock.onPost('/shipments/200/close').reply(200, {});
      const result = await Shipments.handleCloseShipment({ id: '200' });
      assert.ok(JSON.stringify(result).includes('close'));
    });
  });

  // === CONTRACTS ===
  describe('Contracts Tools', () => {
    it('handleCreateContract should post to /contracts', async () => {
      mock.onPost('/contracts').reply(200, '300');
      const result = await Contracts.handleCreateContract({ 
        socid: '1', 
        commercial_signature_id: '1', 
        commercial_suivi_id: '1' 
      });
      assert.ok(JSON.stringify(result).includes('300'));
    });

    it('handleAddContractLine should post to /contracts/{id}/lines', async () => {
      mock.onPost('/contracts/300/lines').reply(200, '301');
      const result = await Contracts.handleAddContractLine({ 
        contract_id: '300', 
        product_id: '50', 
        qty: 1, 
        price: 100 
      });
      assert.ok(JSON.stringify(result).includes('ajoutée'));
    });
  });

  // === TICKETS ===
  describe('Tickets Tools', () => {
    it('handleCreateTicket should post to /tickets', async () => {
      mock.onPost('/tickets').reply(200, '400');
      const result = await Tickets.handleCreateTicket({ 
        subject: 'Help', 
        message: 'Issue', 
        type_code: 'ISSUE' 
      });
      assert.ok(JSON.stringify(result).includes('400'));
    });

    it('handleAddTicketMessage should post to /tickets/{id}/messages', async () => {
      mock.onPost('/tickets/400/messages').reply(200, {});
      const result = await Tickets.handleAddTicketMessage({ id: '400', message: 'Reply' });
      assert.ok(JSON.stringify(result).includes('ajouté'));
    });
  });

  // === EXPENSE REPORTS ===
  describe('Expense Reports Tools', () => {
    it('handleCreateExpenseReport should post to /expensereports', async () => {
      mock.onPost('/expensereports').reply(200, '500');
      const result = await ExpenseReports.handleCreateExpenseReport({ 
        user_id: '1', 
        date_start: 123456, 
        date_end: 123456 
      });
      assert.ok(JSON.stringify(result).includes('500'));
    });

    it('handleApproveExpenseReport should post to /expensereports/{id}/approve', async () => {
      mock.onPost('/expensereports/500/approve').reply(200, {});
      const result = await ExpenseReports.handleApproveExpenseReport({ id: '500' });
      assert.ok(JSON.stringify(result).includes('approuvée'));
    });
  });

  // === INTERVENTIONS ===
  describe('Interventions Tools', () => {
    it('handleCreateIntervention should post to /interventions', async () => {
      mock.onPost('/interventions').reply(200, '600');
      const result = await Interventions.handleCreateIntervention({ socid: '1', fk_project: '10' });
      assert.ok(JSON.stringify(result).includes('600'));
    });

    it('handleValidateIntervention should post to /interventions/{id}/validate', async () => {
      mock.onPost('/interventions/600/validate').reply(200, {});
      const result = await Interventions.handleValidateIntervention({ id: '600' });
      assert.ok(JSON.stringify(result).includes('validée'));
    });
  });

  // === ADVANCED (Projects/Tasks/Users) ===
  describe('Advanced Tools (Projects/Tasks/Users)', () => {
    // Projects
    it('handleCloseProject should post to /projects/{id}/close', async () => {
      mock.onPost('/projects/700/close').reply(200, {});
      const result = await Advanced.handleCloseProject({ id: '700' });
      assert.ok(JSON.stringify(result).includes('clos'));
    });

    // Tasks
    it('handleAssignTaskUser should call assignTaskToUser service', async () => {
      // This one calls a service method, not direct client usually, but let's check implementation
      // It calls dolibarrClient.assignTaskToUser which calls POST /tasks/{id}/contact/{user_id}/...
      mock.onPost(/\/tasks\/800\/contact\/900\/.*/).reply(200, {});
      const result = await Advanced.handleAssignTaskUser({ task_id: '800', user_id: '900' });
      assert.ok(JSON.stringify(result).includes('assigné'));
    });

    // Users
    it('handleDisableUser should post to /users/{id}/disable', async () => {
      mock.onPost('/users/900/disable').reply(200, {});
      const result = await Advanced.handleDisableUser({ id: '900' });
      assert.ok(JSON.stringify(result).includes('désactivé'));
    });
  });

});
