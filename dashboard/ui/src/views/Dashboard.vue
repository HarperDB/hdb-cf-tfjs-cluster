<template>
  <main>
    <v-select
      v-model="datasetStore.visibleLocations"
      :items="datasetStore.locations"
      density="compact"
      chips
      label="Locations"
      multiple
    ></v-select>
    <div style="text-align: end">
      <button style="margin: 0 15px" @click="selectAllLocations()">
        select all
      </button>
      <button style="margin: 0 15px" @click="selectNoneLocations()">
        select none
      </button>
    </div>
    <canvas ref="accuracyChart" width="400" height="200"></canvas>
    <v-table fixed-header height="400">
      <thead>
        <tr>
          <th class="text-left">Location</th>
          <th class="text-left">Already Purchased</th>
          <th class="text-left">Recommended</th>
          <th class="text-left">Purchased Next</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in purchases" :key="idx">
          <td>{{ item.location }}</td>
          <td>{{ item.alreadyPurchased }}</td>
          <td>{{ item.recommended }}</td>
          <td>{{ item.purchasedNext }}</td>
        </tr>
      </tbody>
    </v-table>
  </main>
</template>

<style>
.v-input__details {
  display: none !important;
}
</style>

<script>
import { useDatasetStore } from "@/stores/dataset";
import Chart from "chart.js/auto";
import axios from "axios";
import { ref, onMounted, onBeforeUnmount } from "vue";
export default {
  setup() {
    const graphColors = [
      "#3d315bff",
      "#444b6eff",
      "#708b75ff",
      "#9ab87aff",
      "#f8f991ff",
    ];
    const datasetStore = useDatasetStore();
    const accuracyChart = ref(null);
    const purchases = ref([]);

    let accuracyChartController;
    const chartDatasets = {};

    /*
      The interval to retrieve the production purchases
      and aggregate them into a table and graphs
    */
    const purchaseRetrievalInterval = setInterval(() => {
      datasetStore.locations.forEach((l) => {
        if (!chartDatasets[l]) {
          chartDatasets[l] = new Array(25).fill(0);
        }
      });

      axios({
        url: datasetStore.productionMetricsUrl,
      }).then(({ data }) => {
        const { items } = window.DontForget;
        const locationMetrics = datasetStore.visibleLocations.reduce((a, v) => {
          a[v] = [];
          return a;
        }, {});
        data.forEach((d) => locationMetrics[d.location].push(d.purchased));
        Object.keys(locationMetrics).forEach((k) =>
          chartDatasets[k].push(
            locationMetrics[k].filter((t) => t).length /
              locationMetrics[k].length
          )
        );

        const labels = [...accuracyChartController.data.labels.slice(-25), 0];
        accuracyChartController.data.labels = labels;

        const datasets = [];
        Object.keys(chartDatasets)
          .filter((k) => datasetStore.visibleLocations.includes(k))
          .forEach((k) => {
            datasets.push({
              label: k,
              data: chartDatasets[k].slice(-25),
              fill: "start",
              borderColor: graphColors[datasetStore.locations.indexOf(k)],
            });
          });

        accuracyChartController.data.datasets = datasets;

        accuracyChartController.update("none");
        purchases.value = data
          .filter((d) => datasetStore.visibleLocations.includes(d.location))
          .map((d) => {
            return {
              location: d.location,
              alreadyPurchased: d.alreadyPurchased
                .map((f) => items[f])
                .join(", "),
              recommended: items[d.recommended],
              purchasedNext: d.purchased,
            };
          });
      });
    }, 3000);

    onMounted(() => {
      accuracyChartController = new Chart(accuracyChart.value, {
        type: "line",
        responsive: true,
        data: {
          labels: new Array(25).fill(0),
          datasets: [
            {
              label: "Accuracy",
              data: new Array(25).fill(0),
              fill: "start",
            },
          ],
        },
        options: {
          elements: {
            point: {
              radius: 0,
            },
            line: {
              tension: 0.5,
              // stepped: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    });

    onBeforeUnmount(() => {
      clearInterval(purchaseRetrievalInterval);
    });

    const selectAllLocations = () => {
      datasetStore.visibleLocations = datasetStore.locations;
    };
    const selectNoneLocations = () => {
      datasetStore.visibleLocations = [];
    };

    return {
      datasetStore,
      accuracyChart,
      selectAllLocations,
      selectNoneLocations,
      purchases,
    };
  },
};
</script>
