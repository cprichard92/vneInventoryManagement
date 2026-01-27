import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildInventoryReport,
  buildRecipientList,
  calculateStockOutDate,
  formatRepEmail,
  normalizeInventoryItem,
} from "../src/inventoryReport.js";

describe("inventory report", () => {
  it("normalizes inventory items", () => {
    const item = normalizeInventoryItem({
      sku: "ABC-1",
      name: "Widget",
      onHand: 10,
      price: 5.5,
      costPerUnit: 2,
      lastSoldAt: "2024-01-02",
      imageUrl: "https://example.com/widget.png",
      totalUnitsSold: 3,
      averageDailyUsage: 2,
    });

    assert.equal(item.sku, "ABC-1");
    assert.equal(item.name, "Widget");
  });

  it("calculates stock-out dates", () => {
    const asOfDate = new Date("2024-01-01T00:00:00Z");
    const stockOut = calculateStockOutDate(10, 2, asOfDate);

    assert.equal(stockOut, "2024-01-06");
  });

  it("builds reports and formats email", () => {
    const asOfDate = new Date("2024-01-01T00:00:00Z");
    const report = buildInventoryReport([
      {
        sku: "SKU-1",
        name: "Part",
        onHand: 4,
        price: 2,
        costPerUnit: 1,
        lastSoldAt: "2024-01-03",
        imageUrl: "https://example.com/part.png",
        totalUnitsSold: 5,
        averageDailyUsage: 1,
      },
    ], asOfDate);

    const email = formatRepEmail({ name: "Alex", email: "alex@example.com" }, report);

    assert.match(email.subject, /Inventory report/);
    assert.match(email.body, /Part/);
    assert.match(email.body, /total value/);
    assert.match(email.body, /total COGS/);
  });

  it("builds a unique recipient list", () => {
    const recipients = buildRecipientList(
      ["a@example.com", "b@example.com"],
      ["b@example.com", "c@example.com"],
    );

    assert.deepEqual(recipients, ["a@example.com", "b@example.com", "c@example.com"]);
  });
});
