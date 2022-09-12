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
    <v-table fixed-header height="800" density="compact">
      <thead>
        <tr>
          <th class="text-left" style="width: 40vw">Items Purchased</th>
          <th class="text-left">Location</th>
          <th class="text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, idx) in filteredMappedDataset" :key="idx">
          <td>{{ item.items.join(", ") }}</td>
          <td>{{ item.location }}</td>
          <td>{{ item.date }}</td>
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
import { ref, computed } from "vue";
import { useDatasetStore } from "@/stores/dataset";
export default {
  setup() {
    const datasetStore = useDatasetStore();

    const selectAllLocations = () => {
      datasetStore.visibleLocations = datasetStore.locations;
    };
    const selectNoneLocations = () => {
      datasetStore.visibleLocations = [];
    };

    const filteredMappedDataset = computed(() =>
      window.DontForget.dataset
        .filter((d) => datasetStore.visibleLocations.includes(d.location))
        .map((data) => {
          return {
            items: data.items.map((f) => window.DontForget.items[f]),
            location: data.location,
            date: data.date,
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    );

    return {
      datasetStore,
      filteredMappedDataset,
      selectAllLocations,
      selectNoneLocations,
    };
  },
};
</script>
