import { test, expect } from '@playwright/test';

const BASE_URL = 'http://srv946485.hstgr.cloud:8080/api/v1';

test.describe('Customer API Tests', () => {
    
    test('GET /api/v1/customers - should return list of customers', async ({ request }) => {
        const res = await request.get(`${BASE_URL}/api/v1/api/v1/customers`);
        
        // Check response status
        expect(res.ok()).toBeTruthy();
        expect(res.status()).toBe(200);
        
        // Check response body
        const body = await res.json();
        console.log('Total customers:', body.length);
        
        // Validate response is array with data
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeGreaterThan(0);
        
        // Validate first customer structure
        const customer = body[0];
        expect(customer).toHaveProperty('customer_id');
        expect(customer).toHaveProperty('first_name');
        expect(customer).toHaveProperty('last_name');
        expect(customer).toHaveProperty('email');
        expect(customer).toHaveProperty('gender');
        expect(customer).toHaveProperty('status');
        
        // Validate data types
        expect(typeof customer.customer_id).toBe('number');
        expect(typeof customer.first_name).toBe('string');
        expect(typeof customer.last_name).toBe('string');
        expect(typeof customer.email).toBe('string');
        
        // Validate enum values
        expect(['Male', 'Female', 'Other']).toContain(customer.gender);
        expect(['active', 'inactive', 'suspended']).toContain(customer.status);
        
        // Validate email format
        expect(customer.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    test('GET /api/v1/customers - validate all customers have required fields', async ({ request }) => {
        const res = await request.get(`${BASE_URL}/api/v1/customers`);
        const customers = await res.json();
        
        // Check every customer
        customers.forEach((customer: any, index: number) => {
            expect(customer, `Customer at index ${index}`).toMatchObject({
                customer_id: expect.any(Number),
                first_name: expect.any(String),
                last_name: expect.any(String),
                email: expect.any(String),
                gender: expect.stringMatching(/^(Male|Female|Other)$/),
                status: expect.stringMatching(/^(active|inactive|suspended)$/)
            });
        });
    });

    test('GET /api/v1/customers/:id - should return single customer', async ({ request }) => {
        // First get list to get a valid ID
        const listRes = await request.get(`${BASE_URL}/api/v1/customers`);
        const customers = await listRes.json();
        const customerId = customers[0].customer_id;
        
        // Get single customer
        const res = await request.get(`${BASE_URL}/api/v1/customers/${customerId}`);
        expect(res.ok()).toBeTruthy();
        expect(res.status()).toBe(200);
        
        const customer = await res.json();
        expect(customer.customer_id).toBe(customerId);
        expect(customer).toHaveProperty('first_name');
        expect(customer).toHaveProperty('email');
    });

    test('GET /api/v1/customers/:id - should return 404 for non-existent customer', async ({ request }) => {
        const res = await request.get(`${BASE_URL}/api/v1/customers/999999`);
        expect(res.status()).toBe(404);
    });

    test('POST /api/v1/customers - should create new customer', async ({ request }) => {
        const newCustomer = {
            first_name: 'John',
            last_name: 'Doe',
            email: `test.${Date.now()}@example.com`,
            gender: 'Male',
            status: 'active'
        };
        
        const res = await request.post(`${BASE_URL}/api/v1/customers`, {
            data: newCustomer
        });
        
        expect(res.status()).toBe(201);
        
        const created = await res.json();
        expect(created).toHaveProperty('customer_id');
        expect(created.first_name).toBe(newCustomer.first_name);
        expect(created.email).toBe(newCustomer.email);
    });

    test('POST /api/v1/customers - should validate required fields', async ({ request }) => {
        const invalidCustomer = {
            first_name: 'John'
            // Missing required fields
        };
        
        const res = await request.post(`${BASE_URL}/api/v1/customers`, {
            data: invalidCustomer
        });
        
        expect(res.status()).toBeGreaterThanOrEqual(400);
        expect(res.status()).toBeLessThan(500);
    });

    test('PUT /api/v1/customers/:id - should update customer', async ({ request }) => {
        // Get existing customer
        const listRes = await request.get(`${BASE_URL}/api/v1/customers`);
        const customers = await listRes.json();
        const customerId = customers[0].customer_id;
        
        const updatedData = {
            first_name: 'Updated',
            last_name: 'Name',
            email: customers[0].email,
            gender: customers[0].gender,
            status: 'inactive'
        };
        
        const res = await request.put(`${BASE_URL}/api/v1/customers/${customerId}`, {
            data: updatedData
        });
        
        expect(res.ok()).toBeTruthy();
        
        const updated = await res.json();
        expect(updated.first_name).toBe('Updated');
        expect(updated.status).toBe('inactive');
    });

    test('DELETE /api/v1/customers/:id - should delete customer', async ({ request }) => {
        // Create a customer to delete
        const newCustomer = {
            first_name: 'ToDelete',
            last_name: 'User',
            email: `delete.${Date.now()}@example.com`,
            gender: 'Other',
            status: 'active'
        };
        
        const createRes = await request.post(`${BASE_URL}/api/v1/customers`, {
            data: newCustomer
        });
        const created = await createRes.json();
        
        // Delete it
        const deleteRes = await request.delete(`${BASE_URL}/api/v1/customers/${created.customer_id}`);
        expect(deleteRes.status()).toBeGreaterThanOrEqual(200);
        expect(deleteRes.status()).toBeLessThan(300);
        
        // Verify it's deleted
        const getRes = await request.get(`${BASE_URL}/api/v1/customers/${created.customer_id}`);
        expect(getRes.status()).toBe(404);
    });

    test('GET /api/v1/customers - should handle pagination if supported', async ({ request }) => {
        const res = await request.get(`${BASE_URL}/api/v1/customers?page=1&limit=10`);
        expect(res.ok()).toBeTruthy();
        
        const body = await res.json();
        expect(Array.isArray(body)).toBeTruthy();
        expect(body.length).toBeLessThanOrEqual(10);
    });

    test('GET /api/v1/customers - response time should be acceptable', async ({ request }) => {
        const startTime = Date.now();
        const res = await request.get(`${BASE_URL}/api/v1/customers`);
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        expect(res.ok()).toBeTruthy();
        expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
        
        console.log(`Response time: ${responseTime}ms`);
    });
});