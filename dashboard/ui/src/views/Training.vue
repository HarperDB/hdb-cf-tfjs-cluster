<template>
  <main class="d-flex flex-column justify-space-around" style="height: 100%">
    <div class="d-flex justify-space-around">
      <div class="flex-grow-1" style="margin: 0 25px">
        <v-select
          v-model="modelStore.modelId"
          :items="modelStore.models"
          item-title="name"
          item-value="id"
          density="compact"
          label="Model"
        ></v-select>
        <div style="text-align: end">
          <button
            style="margin: 0 15px"
            @click="
              addNewModelName = '';
              duplicateModel = false;
              addNewModelDialogOpened = true;
            "
          >
            Create New
          </button>
          <button
            style="margin: 0 15px"
            @click="
              renameModelName = modelStore.model.name;
              renameModelDialogOpened = true;
            "
          >
            Rename
          </button>
          <button
            style="margin: 0 15px"
            @click="
              addNewModelName = modelStore.model.name;
              duplicateModel = true;
              addNewModelDialogOpened = true;
            "
          >
            Duplicate
          </button>
          <button
            style="margin: 0 15px"
            @click="deleteModelDialogOpened = true"
          >
            Delete
          </button>
        </div>
      </div>
      <div class="d-flex justify-space-between">
        <v-btn
          @click="trainModel()"
          style="margin: 0 5px"
          color="purple-darken-4"
          >TRAIN</v-btn
        >
        <v-btn
          v-if="modelIsTrained"
          @click="
            deployModelDialogOpened = true;
            modelDeploying = false;
          "
          style="margin: 0 5px"
          color="orange-darken-1"
          >DEPLOY</v-btn
        >
        <v-btn
          v-if="modelIsTraining"
          @click="stopTraining = true"
          style="margin: 0 5px"
          color="red-darken-3"
          >STOP TRAINING</v-btn
        >
      </div>
    </div>
    <Codemirror
      v-model:value="modelCode"
      :options="cmOptions"
      border
      class="flex-shrink-0"
      placeholder="test placeholder"
      @change="saveCode"
      :height="500"
    />
    <canvas ref="accuracyChart" class="flex-shrink-1" height="200"></canvas>
    <v-dialog v-model="addNewModelDialogOpened">
      <v-card style="padding: 25px">
        <v-card-title>New Model</v-card-title>
        <v-card-text>
          <p style="font-size: 16px; margin-bottom: 15px">
            Add a name and click save to create a new model.
          </p>
          <v-form @submit.prevent="addNewModel">
            <v-text-field
              v-model="addNewModelName"
              autofocus
              label="New Model Name"
            ></v-text-field>
            <button type="submit" style="display: none"></button>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-around">
          <v-btn
            @click="addNewModelDialogOpened = false"
            prepend-icon="mdi-close-circle-outline"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="addNewModel"
            prepend-icon="mdi-content-save-outline"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="renameModelDialogOpened">
      <v-card style="padding: 25px">
        <v-card-title>Rename Model</v-card-title>
        <v-card-text>
          <p style="font-size: 16px; margin-bottom: 15px">
            Provide a new name and click save to update the model.
          </p>
          <v-form @submit.prevent="renameModel">
            <v-text-field
              v-model="renameModelName"
              autofocus
              label="New Model Name"
            ></v-text-field>
            <button type="submit" style="display: none"></button>
          </v-form>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-around">
          <v-btn
            @click="renameModelDialogOpened = false"
            prepend-icon="mdi-close-circle-outline"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="renameModel"
            prepend-icon="mdi-content-save-outline"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deleteModelDialogOpened">
      <v-card style="padding: 25px">
        <v-card-title>Delete Model</v-card-title>
        <v-card-text>
          <p style="font-size: 16px; margin-bottom: 15px">
            Are you sure you want to delete the model?
          </p>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-around">
          <v-btn
            @click="renameModelDialogOpened = false"
            prepend-icon="mdi-close-circle-outline"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="deleteModel"
            prepend-icon="mdi-content-save-outline"
            >Delete</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="deployModelDialogOpened">
      <v-card style="padding: 25px">
        <v-card-title>Deploy Model</v-card-title>
        <v-card-text>
          <p
            style="font-size: 16px; margin-bottom: 15px"
            v-if="!modelDeploying"
          >
            Are you sure you want to deploy this model?
          </p>
          <p style="font-size: 16px; margin-bottom: 15px" v-if="modelDeploying">
            The model is being deployed...
          </p>
        </v-card-text>
        <v-card-actions
          class="d-flex justify-space-around"
          v-if="!modelDeploying"
        >
          <v-btn
            @click="renameModelDialogOpened = false"
            prepend-icon="mdi-close-circle-outline"
            >Close</v-btn
          >
          <v-btn
            color="primary"
            @click="deployModel"
            prepend-icon="mdi-content-save-outline"
            >Deploy!</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </main>
</template>

<script>
import { useModelStore } from "@/stores/model";
import axios from "axios";
import Chart from "chart.js/auto";

import sampleSize from "lodash/sampleSize.js";

import Codemirror from "codemirror-editor-vue3";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/dracula.css";
import * as tf from "@tensorflow/tfjs";
import { ref, onMounted, watch } from "vue";
window.tf = tf;
const accuracyChart = ref(null);
export default {
  components: { Codemirror },
  setup() {
    const modelStore = useModelStore();
    const addNewModelDialogOpened = ref(false);
    const addNewModelName = ref("");
    const renameModelDialogOpened = ref(false);
    const renameModelName = ref("");
    const deleteModelDialogOpened = ref(false);
    const deployModelDialogOpened = ref(false);
    const modelDeploying = ref(false);
    const duplicateModel = ref(false);
    const modelCode = ref("");
    const modelIsTraining = ref(false);
    const modelIsTrained = ref(false);
    const stopTraining = ref(false);
    const modelName = ref();

    let model;

    let trainingData;
    let trainedModel;
    let codeSavingTimeout = false;

    if (modelStore.modelId) {
      const model = modelStore.models.find((m) => m.id === modelStore.modelId);
      if (model) {
        modelCode.value = model.code;
      }
    }

    // update code when model changes
    watch(modelStore, () => {
      if (modelStore.modelId) {
        const model = modelStore.models.find(
          (m) => m.id === modelStore.modelId
        );
        if (model) {
          modelCode.value = model.code;
        }
        modelIsTrained.value = false;
      }
    });

    const saveCode = async () => {
      if (codeSavingTimeout) {
        clearTimeout(codeSavingTimeout);
      }

      codeSavingTimeout = setTimeout(() => {
        modelStore.models.find((m) => m.id === modelStore.modelId).code =
          modelCode.value;
        axios({
          url: modelStore.modelUrl,
          method: "POST",
          data: Object.assign(modelStore.model, { code: modelCode.value }),
        });
        codeSavingTimeout = false;
      }, 2500);
    };

    const getModels = async () => {
      await axios({ url: modelStore.modelUrl }).then(({ data }) => {
        modelStore.models = data;
      });
    };

    const addNewModel = async () => {
      addNewModelDialogOpened.value = false;
      const model = {
        ...(duplicateModel.value && modelStore.model),
        name: addNewModelName.value,
        id: null,
      };
      const { data } = await axios({
        url: modelStore.modelUrl,
        method: "POST",
        data: model,
      });
      modelStore.modelId = data.upserted_hashes[0];
      getModels();
    };

    const renameModel = async () => {
      renameModelDialogOpened.value = false;
      const { data } = await axios({
        url: modelStore.modelUrl,
        method: "POST",
        data: { name: renameModelName.value, id: modelStore.modelId },
      });
      getModels();
    };

    const deleteModel = async () => {
      deleteModelDialogOpened.value = false;
      const { data } = await axios({
        url: modelStore.modelUrl,
        method: "POST",
        data: { id: modelStore.modelId, deleted: true },
      });
      await getModels();
      modelStore.modelId = modelStore.models[0].id;
    };

    let accuracyChartController;
    onMounted(() => {
      console.log("accuracyChart.value", accuracyChart.value);
      accuracyChartController = new Chart(accuracyChart.value, {
        type: "line",
        responsive: false,
        data: {
          labels: new Array(25).fill(0),
          datasets: [
            {
              label: "Accuracy",
              data: new Array(25).fill(0),
              fill: "start",
              borderColor: "#df78ef",
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

    const trainModel = () => {
      modelIsTraining.value = true;
      stopTraining.value = false;
      model = eval(modelCode.value);
      model.compile({
        optimizer: "sgd",
        loss: "sparseCategoricalCrossentropy",
        metrics: ["accuracy"],
      });

      const trainingData = [];
      window.DontForget.dataset.forEach((purchase) => {
        const { items } = purchase;
        if (items.length >= 4) {
          for (let i = 0; i < items.length * 20; i++) {
            const features = sampleSize(items, 4);
            const label = features.pop();
            trainingData.push({ features, label });
          }
        }
      });
      const xs = trainingData.map((d) => d.features);
      const ys = trainingData.map((d) => d.label);
      const xTensor = tf.tensor(xs);
      const yTensor = tf.tensor(ys);
      function onBatchEnd(batch, logs) {
        if (stopTraining.value) model.stopTraining = true;
        if (batch % 10 === 0) {
          console.log(batch, logs.acc);
          updateChart(batch, logs.acc);
        }
      }

      // function onEpochEnd(batch, logs) {
      //   updateChart(batch, logs.acc);
      //   //console.log('Accuracy', logs.acc);
      // }
      // Train for 5 epochs with batch size of 16
      model
        .fit(xTensor, yTensor, {
          epochs: 5,
          batchSize: 16,
          callbacks: { onBatchEnd },
        })
        .then((info) => {
          trainedModel = model;
          console.log("trainedModel", trainedModel);
          modelIsTrained.value = true;
          modelIsTraining.value = false;
        });
    };

    function deployModel() {
      modelDeploying.value = true;
      setTimeout(() => {
        deployModelDialogOpened.value = false;
        setTimeout(() => {
          modelDeploying.value = false;
        }, 1500);
      }, 1500);
      trainedModel
        .save(
          tf.io.browserHTTPRequest(modelStore.deployModelUrl, {
            method: "POST",
          })
        )
        .then(() => {
          console.log("SAVED!");
        });
    }

    return {
      modelCode,
      modelIsTrained,
      modelIsTraining,
      duplicateModel,
      deleteModelDialogOpened,
      deleteModel,
      deployModelDialogOpened,
      modelDeploying,
      renameModelName,
      renameModelDialogOpened,
      saveCode,
      renameModel,
      deployModel,
      stopTraining,
      trainModel,
      modelName,
      addNewModel,
      addNewModelDialogOpened,
      addNewModelName,
      trainingData,
      accuracyChart,
      modelStore,
      run,
      cmOptions: {
        mode: "text/javascript", // Language mode
        theme: "dracula", // Theme
        lineNumbers: true, // Show line number
        smartIndent: true, // Smart indent
        indentUnit: 2, // The smart indent unit is 2 spaces in length
        foldGutter: true, // Code folding
        styleActiveLine: true, // Display the style of the selected row
      },
    };
  },
};
</script>
