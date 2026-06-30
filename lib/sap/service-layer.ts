const READ_ONLY_ENTITIES = new Set([
  "BusinessPartners",
  "Items",
  "Orders",
  "DeliveryNotes",
  "Invoices",
  "PurchaseOrders",
  "PurchaseDeliveryNotes",
  "PurchaseInvoices",
  "JournalEntries",
]);

export function hasSapServiceLayerConfig(env: NodeJS.ProcessEnv = process.env) {
  return Boolean(
    env.SAP_B1_SERVICE_LAYER_URL &&
      env.SAP_B1_COMPANY_DB &&
      env.SAP_B1_USERNAME &&
      env.SAP_B1_PASSWORD,
  );
}

export function isReadOnlyEntityAllowed(objectType: string | undefined) {
  if (!objectType) return true;
  return READ_ONLY_ENTITIES.has(objectType);
}

export function getAllowedReadOnlyEntities() {
  return [...READ_ONLY_ENTITIES].sort();
}
