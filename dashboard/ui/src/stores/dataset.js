import { defineStore } from "pinia";

export const useDatasetStore = defineStore({
  id: "dataset",
  persist: false,
  state: () => ({
    productionMetricsUrl:
      "http://localhost:9406/tfjs-cluster/production_metrics",
    datasetUrl: "http://localhost:9406/tfjs-cluster/purchases",
    dataset: [],
    itemsUrl: "http://localhost:9406/tfjs-cluster/items",
    items: {},
    locations: [],
    visibleLocations: [],
  }),
});
