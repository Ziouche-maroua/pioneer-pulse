require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Backend Service running on port ${PORT}`);
  console.log(` Write endpoints: http://localhost:${PORT}/service, /metrics`);
  console.log(` Read endpoints: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});