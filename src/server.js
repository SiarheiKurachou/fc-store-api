const appName = require("./../package").name;
const http = require("http");
const express = require("express");
const log4js = require("log4js");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");

const app = express();

const apiRouter = require("./routers/index");

const logger = log4js.getLogger(appName);
logger.level = process.env.LOG_LEVEL || "info";

// load local VCAP configuration  and service credentials
let vcapLocal;
try {
  vcapLocal = require("../vcap-local.json");
  logger.info("Loaded local VCAP");
} catch (e) {
  logger.error(e);
}

const appEnvOpts = vcapLocal
  ? {
      vcap: vcapLocal,
    }
  : {};

// Within the application environment (appenv) there's a services object
let services = appEnvOpts.vcap;

// Setup express application to use express-session middleware
// Must be configured with proper session storage for production
// environments. See https://github.com/expressjs/session for
// additional documentation
app.use(
  session({
    secret: "123456",
    resave: true,
    saveUninitialized: true,
    proxy: true,
  })
);

let options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

let connectionString = null;
// The services object is a map named by service so we extract the one for MongoDB
let mongodbServices = services && ["databases-for-mongodb"];
if (mongodbServices !== undefined) {
  // We now take the first bound MongoDB service and extract it's credentials object
  let mongodbConn = mongodbServices[0].credentials.connection.mongodb;

  // Read the CA certificate and assign that to the CA variable
  let ca = [Buffer.from(mongodbConn.certificate.certificate_base64, "base64")];

  // We always want to make a validated TLS/SSL connection
  options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    sslValidate: true,
    sslCA: ca,
  };

  // Extract the database username and password
  let authentication = mongodbConn.authentication;
  let username = authentication.username;
  let password = authentication.password;

  // Extract the MongoDB URIs
  let connectionPath = mongodbConn.hosts;
  connectionString = `mongodb://${username}:${password}@${connectionPath[0].hostname}:${connectionPath[0].port},${connectionPath[1].hostname}:${connectionPath[1].port}/FC-STORE?authSource=admin&replicaSet=replset`;
}

mongoose.connect(
  connectionString ||
    process.env.DB_URL ||
    "mongodb://localhost:27017/FC-STORE",
  options
);

const db = mongoose.connection;
db.on("error", (error) => logger.error(error));
db.once("open", () => logger.info("connected to database"));

const server = http.createServer(app);

app.use(log4js.connectLogger(logger, { level: logger.level }));

app.use("/api", apiRouter);

const port = process.env.PORT || 8264;
server.listen(port, () => {
  logger.info(`Listening on http://localhost:${port}`);
});
