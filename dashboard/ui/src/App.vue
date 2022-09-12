<template>
  <v-app class="dfi-app">
    <v-app-bar prominent color="purple-darken-4">
      <v-app-bar-nav-icon
        v-if="!contentLoading"
        @click.stop="navDrawerOpened = !navDrawerOpened"
      ></v-app-bar-nav-icon>
      <img src="@/assets/harperdb.png" height="45" />
      <v-app-bar-title class="text-white"
        ><router-link to="/" style="text-decoration: none" class="text-white"
          >Don't Forget It!</router-link
        >
        - {{ $route.name }}</v-app-bar-title
      >
    </v-app-bar>
    <v-navigation-drawer v-model="navDrawerOpened" v-if="!contentLoading">
      <v-list>
        <v-list-item style="margin: 5px 0">
          <router-link to="/" style="text-decoration: none; font-size: 18px"
            ><v-icon
              end
              icon="mdi-desktop-tower-monitor"
              style="margin-right: 5px; margin-top: -3px; text-decoration: none"
            ></v-icon
            >Production Monitoring</router-link
          >
        </v-list-item>
        <v-list-item style="margin: 5px 0">
          <router-link
            to="/training"
            style="text-decoration: none; font-size: 18px"
          >
            <v-icon end icon="mdi-train"></v-icon>Model Training</router-link
          >
        </v-list-item>
        <v-list-item style="margin: 5px 0">
          <router-link to="/data" style="text-decoration: none; font-size: 18px"
            ><v-icon end icon="mdi-text-box-search-outline"></v-icon>Data
            Viewer</router-link
          >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view v-if="!contentLoading" />
      <div class="d-flex flex-column justify-space-around" style="height: 65%">
        <v-progress-linear
          v-if="!contentLoading"
          indeterminate
          striped
          color="purple"
        />
      </div>
    </v-main>
  </v-app>
</template>

<style>
.dfi-app {
  overflow-y: hidden;
}
</style>

<script>
import axios from "axios";
import { useDatasetStore } from "@/stores/dataset";
import { useModelStore } from "@/stores/model";
import { ref } from "vue";
export default {
  setup() {
    const datasetStore = useDatasetStore();
    const modelStore = useModelStore();
    const navDrawerOpened = ref(false);
    const contentLoading = ref(true);

    window.DontForget = {};

    const getData = async () => {
      // get models
      try {
        await axios({ url: modelStore.modelUrl }).then(({ data }) => {
          modelStore.models = data;
        });
      } catch (error) {
        console.log("error", error);
      }
      // get items
      await axios({ url: datasetStore.itemsUrl }).then(({ data }) => {
        window.DontForget.items = data.reduce((all, item) => {
          all[item.index] = item.item?.trim();
          return all;
        }, {});
      });
      // get dataset
      await axios({ url: datasetStore.datasetUrl }).then(({ data }) => {
        window.DontForget.dataset = data;
      });

      datasetStore.locations = Array.from(
        new Set(window.DontForget.dataset.map((d) => d.location))
      ).sort();

      datasetStore.visibleLocations = datasetStore.locations;

      contentLoading.value = false;
    };

    getData();

    return {
      contentLoading,
      navDrawerOpened,
    };
  },
};
</script>
