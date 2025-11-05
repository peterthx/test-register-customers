import { test, expect } from '@playwright/test';

test('GET list', async ({ request }) => {
    const res = await request.get('http://srv946485.hstgr.cloud:8080/api/v1/customers');
    expect(res.ok()).toBeTruthy();

    expect(res.ok()).toBeTruthy();

    const body = await res.json();
    console.log(body);

    // response must be array
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    // check first item
    const item = body[0];
    expect(item).toHaveProperty('customer_id');
    expect(item).toHaveProperty('first_name');
    expect(item).toHaveProperty('last_name');
    expect(item).toHaveProperty('email');
    expect(item).toHaveProperty('gender');
    expect(item).toHaveProperty('status');

    // specific expected
    expect(['Male', 'Female', 'Other']).toContain(item.gender);
    expect(['active', 'inactive', 'suspended']).toContain(item.status);

});
