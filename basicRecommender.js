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
