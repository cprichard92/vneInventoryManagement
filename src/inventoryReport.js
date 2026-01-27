/**
 * Inventory report utilities.
 *
 * All inputs are treated as untrusted and validated before use.
 */

const MAX_ITEM_NAME_LENGTH = 200;
const MAX_RECIPIENTS = 500;
const MAX_IMAGE_URL_LENGTH = 1000;

function normalizeOptionalUrl(url) {
  if (!url) {
    return null;
  }

  const trimmed = String(url).trim();
  if (trimmed.length > MAX_IMAGE_URL_LENGTH) {
    throw new Error("Item image URL is too long.");
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    throw new Error("Item image URL must be http or https.");
  }

  return trimmed;
}

function normalizeOptionalDate(value) {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date value.");
  }

  return date.toISOString().slice(0, 10);
}

/**
 * Validate and normalize an inventory item.
 *
 * @param {object} item
 * @param {string} item.sku
 * @param {string} item.name
 * @param {number} item.onHand
 * @param {number} item.price
 * @param {number} item.costPerUnit
 * @param {string | Date} item.lastSoldAt
 * @param {string} item.imageUrl
 * @param {number} item.totalUnitsSold
 * @param {number} item.averageDailyUsage
 * @returns {object} normalized item
 * @throws {Error} if validation fails
 */
export function normalizeInventoryItem(item) {
  if (!item || typeof item !== "object") {
    throw new Error("Item must be an object.");
  }

  const sku = String(item.sku ?? "").trim();
  const name = String(item.name ?? "").trim();
  const onHand = Number(item.onHand);
  const price = Number(item.price);
  const costPerUnit = Number(item.costPerUnit);
  const averageDailyUsage = Number(item.averageDailyUsage);
  const totalUnitsSold = Number(item.totalUnitsSold);
  const imageUrl = normalizeOptionalUrl(item.imageUrl);
  const lastSoldAt = normalizeOptionalDate(item.lastSoldAt);

  if (!sku) {
    throw new Error("Item sku is required.");
  }

  if (!name || name.length > MAX_ITEM_NAME_LENGTH) {
    throw new Error("Item name is required and must be short.");
  }

  if (!Number.isFinite(onHand) || onHand < 0) {
    throw new Error("Item onHand must be a non-negative number.");
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Item price must be a non-negative number.");
  }

  if (!Number.isFinite(costPerUnit) || costPerUnit < 0) {
    throw new Error("Item costPerUnit must be a non-negative number.");
  }

  if (!Number.isFinite(averageDailyUsage) || averageDailyUsage < 0) {
    throw new Error("Item averageDailyUsage must be a non-negative number.");
  }

  if (!Number.isFinite(totalUnitsSold) || totalUnitsSold < 0) {
    throw new Error("Item totalUnitsSold must be a non-negative number.");
  }

  return {
    sku,
    name,
    onHand,
    price,
    costPerUnit,
    averageDailyUsage,
    totalUnitsSold,
    imageUrl,
    lastSoldAt,
    totalValue: onHand * price,
    totalCostOfGoodsSold: totalUnitsSold * costPerUnit,
  };
}

/**
 * Calculate a stock-out date based on on-hand quantity and daily usage.
 *
 * @param {number} onHand
 * @param {number} averageDailyUsage
 * @param {Date} asOfDate
 * @returns {string | null} ISO date string (YYYY-MM-DD) or null if not applicable
 */
export function calculateStockOutDate(onHand, averageDailyUsage, asOfDate) {
  if (!Number.isFinite(onHand) || !Number.isFinite(averageDailyUsage)) {
    throw new Error("onHand and averageDailyUsage must be numbers.");
  }

  if (!(asOfDate instanceof Date) || Number.isNaN(asOfDate.getTime())) {
    throw new Error("asOfDate must be a valid Date.");
  }

  if (averageDailyUsage <= 0 || onHand <= 0) {
    return null;
  }

  const daysRemaining = Math.ceil(onHand / averageDailyUsage);
  const stockOut = new Date(Date.UTC(
    asOfDate.getUTCFullYear(),
    asOfDate.getUTCMonth(),
    asOfDate.getUTCDate() + daysRemaining,
  ));

  return stockOut.toISOString().slice(0, 10);
}

/**
 * Build a per-rep inventory report.
 *
 * @param {Array<object>} items
 * @param {Date} asOfDate
 * @returns {{ asOfDate: string, items: Array<object> }} report
 */
export function buildInventoryReport(items, asOfDate) {
  if (!Array.isArray(items)) {
    throw new Error("items must be an array.");
  }

  if (!(asOfDate instanceof Date) || Number.isNaN(asOfDate.getTime())) {
    throw new Error("asOfDate must be a valid Date.");
  }

  const normalizedItems = items.map(normalizeInventoryItem).map((item) => ({
    ...item,
    expectedStockOutDate: calculateStockOutDate(
      item.onHand,
      item.averageDailyUsage,
      asOfDate,
    ),
  }));

  return {
    asOfDate: asOfDate.toISOString().slice(0, 10),
    items: normalizedItems,
  };
}

/**
 * Build a recipient list from a base list plus any new addresses.
 *
 * @param {string[]} baseRecipients
 * @param {string[]} addedRecipients
 * @returns {string[]} unique, trimmed emails
 */
export function buildRecipientList(baseRecipients, addedRecipients) {
  const baseList = Array.isArray(baseRecipients) ? baseRecipients : [];
  const addedList = Array.isArray(addedRecipients) ? addedRecipients : [];
  const merged = [...baseList, ...addedList]
    .map((email) => String(email ?? "").trim())
    .filter(Boolean);

  if (merged.length > MAX_RECIPIENTS) {
    throw new Error("Recipient list exceeds maximum size.");
  }

  return Array.from(new Set(merged));
}

/**
 * Format a summary for a rep email.
 *
 * @param {object} rep
 * @param {string} rep.name
 * @param {string} rep.email
 * @param {{ asOfDate: string, items: Array<object> }} report
 * @returns {{ subject: string, body: string }}
 */
export function formatRepEmail(rep, report) {
  if (!rep || typeof rep !== "object") {
    throw new Error("rep must be an object.");
  }

  const name = String(rep.name ?? "").trim();
  const email = String(rep.email ?? "").trim();

  if (!name) {
    throw new Error("rep name is required.");
  }

  if (!email) {
    throw new Error("rep email is required.");
  }

  if (!report || typeof report !== "object") {
    throw new Error("report must be an object.");
  }

  const lines = report.items.map((item) => {
    const stockOut = item.expectedStockOutDate ?? "N/A";
    const imageInfo = item.imageUrl ? `image: ${item.imageUrl}` : "image: N/A";
    const lastSoldInfo = item.lastSoldAt ? `last sold ${item.lastSoldAt}` : "last sold N/A";
    return [
      `- ${item.name} (${item.sku}):`,
      `${item.onHand} on hand, $${item.price.toFixed(2)} per unit`,
      `total value $${item.totalValue.toFixed(2)}`,
      `total COGS $${item.totalCostOfGoodsSold.toFixed(2)}`,
      `${lastSoldInfo}, stock-out ${stockOut}, ${imageInfo}`,
    ].join(" ");
  });

  return {
    subject: `Inventory report (${report.asOfDate})`,
    body: [
      `Hi ${name},`,
      "",
      `Here is your inventory report as of ${report.asOfDate}:`,
      ...lines,
      "",
      "Reply if you have questions.",
    ].join("\n"),
  };
}
