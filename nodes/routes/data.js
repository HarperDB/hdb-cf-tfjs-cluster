import fs from "fs";
import pm2Controller from "../helpers/pm2Controller.js";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sampleSize from "lodash/sampleSize.js";
import sample from "lodash/sample.js";
import * as tf from "@tensorflow/tfjs-node";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async (server, { hdbCore, logger }) => {
  await pm2Controller.start("receiver", [], { logger });
  server.route({
    url: "/hello",
    method: "GET",
    handler: async (request, reply) => {
      return "hello";
    },
  });

  server.route({
    url: "/newModel/:modelId",
    method: "GET",
    handler: async (request, reply) => {
      const deployedModels = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "search_by_hash",
          schema: "dont_forget",
          table: "deployed_models",
          hash_values: [request.params.modelId],
          get_attributes: ["files"],
        },
      });

      const filePath = join(__dirname, "..", "model");
      deployedModels[0].files.forEach((modelFile) => {
        fs.writeFileSync(
          `${filePath}/${modelFile.filename}`,
          Buffer.from(modelFile.data.data, "base64")
        );
      });

      const model = await tf.loadLayersModel(`file://${filePath}/model.json`);

      const modelMetricsResponse = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "insert",
          schema: "dont_forget",
          table: "model_metrics",
          records: [{ state: "training" }],
        },
      });
      const modelId = modelMetricsResponse.inserted_hashes[0];

      const purchases = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "sql",
          sql: "SELECT * FROM dont_forget.purchases",
        },
      });

      const trainingData = [];
      purchases.forEach((purchase) => {
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
        if (batch % 10 === 0) {
          console.log(batch, logs.acc);
          // updateChart(batch, logs.acc)
        }
      }

      async function onEpochEnd(epochs, logs) {
        const trainingAccuracy = logs.acc;
        await hdbCore.requestWithoutAuthentication({
          body: {
            operation: "update",
            schema: "dont_forget",
            table: "model_metrics",
            records: [{ id: modelId, epochs: epochs + 1, trainingAccuracy }],
          },
        });
      }
      // Train for 5 epochs with batch size of 32.

      model.compile({
        optimizer: "sgd",
        loss: "sparseCategoricalCrossentropy",
        metrics: ["accuracy"],
      });

      const output = model.evaluate(xTensor, yTensor);
      const [initialAccuracy] = output[1].dataSync();

      await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "update",
          schema: "dont_forget",
          table: "model_metrics",
          records: [{ id: modelId, initialAccuracy }],
        },
      });

      await model
        .fit(xTensor, yTensor, {
          epochs: 1,
          batchSize: 16,
          callbacks: { onEpochEnd },
        })
        .then((info) => {
          console.log("Final accuracy", info.history.acc);
        });

      const output2 = model.evaluate(xTensor, yTensor);
      const [trainedAccuracy] = output2[1].dataSync();
      await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "update",
          schema: "dont_forget",
          table: "model_metrics",
          records: [{ id: modelId, trainedAccuracy, state: "production" }],
        },
      });
      const otherTrainingModels = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "search_by_value",
          schema: "dont_forget",
          table: "model_metrics",
          search_attribute: "state",
          search_value: "training",
          get_attributes: ["id"],
        },
      });
      const otherProductionModels = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "search_by_value",
          schema: "dont_forget",
          table: "model_metrics",
          search_attribute: "state",
          search_value: "production",
          get_attributes: ["id"],
        },
      });
      await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "update",
          schema: "dont_forget",
          table: "model_metrics",
          records: otherTrainingModels
            .concat(otherProductionModels)
            .filter((r) => r.id !== modelId)
            .map((r) => ({ id: r.id, state: "retired" })),
        },
      });

      const validPurchases = purchases.filter((p) => p.items.length >= 4);

      while (true) {
        const currentModel = await hdbCore.requestWithoutAuthentication({
          body: {
            operation: "search_by_value",
            schema: "dont_forget",
            table: "model_metrics",
            search_attribute: "state",
            search_value: "production",
            get_attributes: ["id"],
          },
        });
        if (currentModel[0].id !== modelId) break;
        const purchase = sample(validPurchases);
        const features = sampleSize(purchase.items, 3);
        const xTensor = tf.tensor([features]);

        const predictionsTensor = model.predict(xTensor);
        const predictions = predictionsTensor.argMax(1).dataSync();
        const recommended = predictions[0];
        const purchased = purchase.items.includes(recommended);
        await hdbCore.requestWithoutAuthentication({
          body: {
            operation: "insert",
            schema: "dont_forget",
            table: "production_metrics",
            records: [
              {
                alreadyPurchased: features,
                recommended,
                purchased,
                location: process.env.NODE_NAME,
              },
            ],
          },
        });
        await new Promise((r) => setTimeout(r, Math.random() * 10000));
      }
    },
  });
};
