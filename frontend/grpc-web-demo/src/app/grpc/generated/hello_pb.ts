import { BinaryReader, BinaryWriter } from 'google-protobuf';

export class HelloRequest {
  private name = '';

  getName(): string {
    return this.name;
  }

  setName(value: string): HelloRequest {
    this.name = value;
    return this;
  }

  serializeBinary(): Uint8Array {
    const writer = new BinaryWriter();

    if (this.name.length > 0) {
      writer.writeString(1, this.name);
    }

    return writer.getResultBuffer();
  }

  static deserializeBinary(bytes: Uint8Array): HelloRequest {
    const reader = new BinaryReader(bytes);
    const message = new HelloRequest();

    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }

      const field = reader.getFieldNumber();
      if (field === 1) {
        message.setName(reader.readString());
      } else {
        reader.skipField();
      }
    }

    return message;
  }
}

export class HelloReply {
  private message = '';

  getMessage(): string {
    return this.message;
  }

  setMessage(value: string): HelloReply {
    this.message = value;
    return this;
  }

  serializeBinary(): Uint8Array {
    const writer = new BinaryWriter();

    if (this.message.length > 0) {
      writer.writeString(1, this.message);
    }

    return writer.getResultBuffer();
  }

  static deserializeBinary(bytes: Uint8Array): HelloReply {
    const reader = new BinaryReader(bytes);
    const response = new HelloReply();

    while (reader.nextField()) {
      if (reader.isEndGroup()) {
        break;
      }

      const field = reader.getFieldNumber();
      if (field === 1) {
        response.setMessage(reader.readString());
      } else {
        reader.skipField();
      }
    }

    return response;
  }
}
