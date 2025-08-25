import { test, expect } from "@playwright/test";

test.describe("Test call api service", () => {
  test("Check data return for api ", async ({ request }) => {
    const res = await request.get(`https://api.restful-api.dev/objects/1`, {
      headers: {
        Accept: "application/json",
      },
    });

    expect(res.status()).toBe(200);
    const jsonData = await res.json();
    expect(jsonData.id).toBe("1");
    expect(jsonData.name).toBe("Google Pixel 6 Pro");
    expect(jsonData.data.color).toBe("Cloudy White");
    expect(jsonData.data.capacity).toBe("128 GB");
    
  });
});
