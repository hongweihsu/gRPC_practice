const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "hello.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const helloProto = grpc.loadPackageDefinition(packageDefinition).hello;

function sayHello(call, callback) {
  const name = call.request.name || "World";
  callback(null, { message: `Hello, ${name} from gRPC server!` });
}

function main() {
  const server = new grpc.Server();

  server.addService(helloProto.Greeter.service, {
    SayHello: sayHello,
  });

  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err) => {
      if (err) {
        console.error("Failed to start gRPC server:", err);
        return;
      }

      console.log("gRPC server running on 0.0.0.0:50051");
    }
  );
}

main();
