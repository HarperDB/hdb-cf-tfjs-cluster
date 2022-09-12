import { defineStore } from "pinia";

export const useModelStore = defineStore({
  id: "model",
  persist: true,
  state: () => ({
    modelUrl: "http://localhost:9406/tfjs-cluster/models",
    deployModelUrl: "http://localhost:9406/tfjs-cluster/deployModel",
    code: "",
    models: [],
    modelId: "",
  }),
  getters: {
    model: (state) => {
      return state.models.find((m) => m.id === state.modelId);
    },
  },
});
