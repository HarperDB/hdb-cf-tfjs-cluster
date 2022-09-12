import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Training from "../views/Training.vue";
import DataViewer from "../views/DataViewer.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Production Monitoring",
      component: Dashboard,
    },
    {
      path: "/training",
      name: "Training Dashboard",
      component: Training,
    },
    {
      path: "/data",
      name: "Data Viewer",
      component: DataViewer,
    },
  ],
});

export default router;
