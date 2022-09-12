# HarperDB TensorFlow.js Cluster
A POC to demonstrate how to setup a clustered database topography to train and deploy a TensorFlow.js recommendation model.

## Summary
This is a hub and spoke style configuration - with one central node that is responsible for creating and training the model. Once that model is saved, the spoke nodes, which are subscribed to the models table, automatically receive the new model and train it on local data. After the model is trained it's put into a simulated production environment using the dataset.

The advantage of this design is being able to quickly deploy a model to multiple locations, and have those locations report back their production metrics so that the model can be improved and deployed again.

## Prereqs
- Docker installed
- A [HarperDB](http://harperdb.io/) Account

## Setup
1. Clone this repo into a local folder
2. Run `make` - launches the 6 nodes (1 hub, 5 spokes)
3. Open the [HarperDB Studio](https://studio.harperdb.io/) and add all of the nodes.
4. Run `node setup.js` - to setup pub/sub between the 6 nodes
5. Run `node cleanData.js` - parse and insert the datasetNice
6. Visit [http://localhost:9406/tfjs-cluster/ui/](http://localhost:9406/tfjs-cluster/ui/) - to code, train, and deploy a model.

## Example Model
This is a simple model that can be used in the Training Dashboard to begin training and deploying a recommender.

```
const nItems = 168;
const embeddingSize = 50;

const itemsInCart = tf.input({ shape: [3] });
const itemsInCartEmbedding = tf.layers
  .embedding({
    inputDim: nItems,
    outputDim: embeddingSize,
    embeddingsInitializer: "heNormal",
    embeddingsRegularizer: tf.regularizers.l2({ l2: 1e-6 }),
  })
  .apply(itemsInCart);

const deep1 = tf.layers.dense({ units: 50 }).apply(itemsInCartEmbedding);
const deep2 = tf.layers.dense({ units: 50 }).apply(deep1);

const flat = tf.layers.flatten().apply(deep2);

const deepFlat1 = tf.layers
  .dense({ units: 500, activation: "relu" })
  .apply(flat);
const deepFlat2 = tf.layers
  .dense({ units: 500, activation: "relu" })
  .apply(deepFlat1);
const deepFlat3 = tf.layers
  .dense({ units: 250, activation: "relu" })
  .apply(deepFlat2);

const output = tf.layers
  .dense({ units: nItems, activation: "softmax" })
  .apply(deepFlat3);

const model = tf.model({ inputs: itemsInCart, outputs: output });

model;
```

## Dashboard Development
To work on the dashboard run `make bash` and traverse to `/opt/harperdb/hdb/custom_functions/tfjs-cluster/ui` inside of the container.

From here the node modules can be installed with `npm i` and then a development server can be launched with `npm run dev`. That will be mapped to [http://localhost:5173](http://localhost:5173).
