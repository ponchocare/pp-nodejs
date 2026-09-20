# parseRequest

This method allows to parse a request received from PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
await client.parseRequest(request);
```

## Usage

Declaration:

```ts
client.parseRequest(request: Request): Promise<object>;
```

Parameters:

| Parameter | Description        |
| --------- | ------------------ |
| request   | The request object |


Returns:

This method returns a promise with the deserialised JSON object sent from PonchoPay. An error will be thrown if the callback was not sent by PonchoPay.
