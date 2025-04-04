import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Vehicle Tracking API",
    version: "1.0.0",
    description: "API for tracking vehicles, drivers, and trips",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      CustomerID: {
        type: "apiKey",
        in: "header",
        name: "X-Customer-ID",
        description: "Customer ID required for authentication",
      },
    },
  },
  security: [
    {
      CustomerID: [],
    },
  ],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
    {
      name: "Customers",
      description: "Customer management endpoints",
    },
    {
      name: "Vehicles",
      description: "Vehicle management endpoints",
    },
    {
      name: "Drivers",
      description: "Driver management endpoints",
    },
    {
      name: "Trips",
      description: "Trip management endpoints",
    },
    {
      name: "Positions",
      description: "Vehicle position tracking endpoints",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.ts", "./src/models/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
