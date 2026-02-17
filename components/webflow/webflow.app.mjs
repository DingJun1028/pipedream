import { WebflowClient } from "webflow-api";
import constants from "./common/constants.mjs";

export default {
  type: "app",
  app: "webflow",
  propDefinitions: {
    domains: {
      label: "Custom Domains",
      description: "Select one or more custom domains to publish.",
      type: "string[]",
      async options({ siteId }) {
        const domains = await this.listDomains(siteId);
        return domains.map((id, url) => ({
          label: url,
          id,
        }));
      },
    },
    sites: {
      label: "Site",
      description: "Select a site or provide a custom site ID.",
      type: "string",
      async options() {
        const sites = await this.listSites();

        return sites.map((site) => ({
          label: site.displayName || site.shortName,
          value: site.id,
        }));
      },
    },
    collections: {
      label: "Collection",
      description: "Select a collection or provide a custom collection ID.",
      type: "string",
      async options({ siteId }) {
        const collections = await this.listCollections(siteId);

        return collections.map((collection) => ({
          label: collection.displayName || collection.slug,
          value: collection.id,
        }));
      },
    },
    items: {
      label: "Item",
      description: "Select an item or provide a custom item ID.",
      type: "string",
      async options({
        collectionId, page,
      }) {
        const items = await this.listCollectionItems(page, collectionId);

        return items.map((item) => ({
          label: item.fieldData?.name || item.fieldData?.slug,
          value: item.id,
        }));
      },
    },
    orders: {
      label: "Order",
      description: "Select an order, or provide a custom order ID.",
      type: "string",
      async options({
        siteId, page,
      }) {
        const items = await this.listOrders({
          page,
          siteId,
        });

        return items.map((item) => item.orderId);
      },
    },
  },
  methods: {
    _authToken() {
      return this.$auth.oauth_access_token;
    },
    webflowClient() {
      return new WebflowClient({
        accessToken: this._authToken(),
      });
    },
    async createWebhook(siteId, data) {
      const response = await this.webflowClient().webhooks.create(siteId, data);
      return response?.data;
    },
    async removeWebhook(webhookId) {
      const response = await this.webflowClient().webhooks.delete(webhookId);
      return response?.data;
    },
    async getOrder(siteId, orderId) {
      const response = await this.webflowClient().orders.get(siteId, orderId);
      return response?.data;
    },
    async listOrders({
      page: offset = 0, siteId, status,
    }) {
      const response = await this.webflowClient().orders.list(siteId, {
        offset,
        status,
      });
      return response?.data?.orders;
    },
    async listDomains(siteId) {
      const response = await this.webflowClient().sites.getCustomDomain(siteId);
      return response?.data?.customDomains;
    },
    async getSite(siteId) {
      const response = await this.webflowClient().sites.get(siteId);
      return response?.data;
    },
    async listSites() {
      const response = await this.webflowClient().sites.list();
      return response?.data?.sites;
    },
    async getCollection(collectionId) {
      const response = await this.webflowClient().collections.get(collectionId);
      return response?.data;
    },
    async listCollections(siteId) {
      if (!siteId) return [];

      const response = await this.webflowClient().collections.list(siteId);
      return response?.data?.collections;
    },
    async listCollectionItems(page = 0, collectionId) {
      if (!collectionId) return [];

      const response = await this.webflowClient().collections.items.listItems(collectionId, {
        limit: constants.LIMIT,
        offset: page,
      });

      return response?.data?.items;
    },
    async getCollectionItem(collectionId, itemId) {
      const response = await this.webflowClient().collections.items.getItem(collectionId, itemId);
      return response?.data;
    },
    async deleteCollectionItem(collectionId, itemId) {
      const response = await this.webflowClient().collections.items.deleteItem(collectionId, itemId);
      return response?.data;
    },
    async createCollectionItem(collectionId, data) {
      const response = await this.webflowClient().collections.items.createItem(collectionId, { body: data });
      return response?.data;
    },
    async updateCollectionItem(collectionId, itemId, data) {
      const response = await this.webflowClient().collections.items.updateItem(collectionId, itemId, { body: data });
      return response?.data;
    },
    async getCollectionItemInventory(collectionId, itemId) {
      const response = await this.webflowClient().inventory.list(collectionId, itemId);
      return response?.data;
    },
    async updateCollectionItemInventory(collectionId, itemId, data) {
      const response = await this.webflowClient().inventory.update(collectionId, itemId, data);
      return response?.data;
    },
    async publishSite(siteId, customDomains) {
      const response = await this.webflowClient().sites.publish(siteId, {
        customDomains,
      });
      return response?.data;
    },
    async fulfillOrder(siteId, orderId, data) {
      const response = await this.webflowClient().orders.updateFulfill(siteId, orderId, data);
      return response?.data;
    },
    async unfulfillOrder(siteId, orderId) {
      const response = await this.webflowClient().orders.updateUnfulfill(siteId, orderId);
      return response?.data;
    },
    async refundOrder(siteId, orderId) {
      const response = await this.webflowClient().orders.refund(siteId, orderId);
      return response?.data;
    },
    async updateOrder(siteId, orderId, data) {
      const response = await this.webflowClient().orders.update(siteId, orderId, data);
      return response?.data;
    },
  },
};
