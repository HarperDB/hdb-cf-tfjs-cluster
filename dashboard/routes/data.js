// used to allow for multipart form uploads - the model.save function from TFJS
import multipart from "fastify-multipart";

export default async (server, { hdbCore, logger }) => {
  await server.register(multipart);

  server.route({
    url: "/purchases",
    method: "GET",
    handler: async (request, reply) => {
      const purchases = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "sql",
          sql: "SELECT * FROM dont_forget.purchases",
        },
      });
      return purchases;
    },
  });
  server.route({
    url: "/items",
    method: "GET",
    handler: async (request, reply) => {
      return hdbCore.requestWithoutAuthentication({
        body: {
          operation: "sql",
          sql: "SELECT * FROM dont_forget.items",
        },
      });
    },
  });
  server.route({
    url: "/production_metrics",
    method: "GET",
    handler: async (request, reply) => {
      return hdbCore.requestWithoutAuthentication({
        body: {
          operation: "sql",
          sql: "SELECT * FROM dont_forget.production_metrics ORDER BY __createdtime__ DESC LIMIT 250",
        },
      });
    },
  });
  server.route({
    url: "/models",
    method: "GET",
    handler: async (request, reply) => {
      return hdbCore.requestWithoutAuthentication({
        body: {
          operation: "search_by_value",
          schema: "dont_forget",
          table: "models",
          search_attribute: "deleted",
          search_value: false,
          get_attributes: ["id", "name", "code"],
        },
      });
    },
  });
  server.route({
    url: "/models",
    method: "POST",
    handler: async (request, reply) => {
      const model = Object.assign(
        { code: "", name: "", deleted: false },
        request.body
      );
      const response = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "upsert",
          schema: "dont_forget",
          table: "models",
          records: [model],
        },
      });
      console.log("response", response);
      return response;
    },
  });
  server.route({
    url: "/deployModel",
    method: "POST",
    handler: async (request, reply) => {
      const record = {
        files: [],
        id: request.params.id,
      };
      const parts = request.files();
      for await (const part of parts) {
        record.files.push({
          filename: part.filename,
          data: await part.toBuffer(),
        });
      }
      await hdbCore.requestWithoutAuthentication({
        body: {
          operation: "insert",
          schema: "dont_forget",
          table: "deployed_models",
          records: [record],
        },
      });
      console.log("inserted!");

      reply.code(200).send();
    },
  });
};
