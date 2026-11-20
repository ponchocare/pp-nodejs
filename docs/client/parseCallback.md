# parseCallback

This method allows to parse a callback received from PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
client.parseCallback(signature, payload);
```

## Usage

Declaration:

```ts
client.parseCallback(signature: string, payload: string): object;
```

Parameters:

| Parameter | Description                             |
| --------- | --------------------------------------- |
| signature | The signature header sent by PonchoPay. |
| payload   | The raw payload as a string             |


Returns:

The deserialised JSON object sent from PonchoPay. An error will be thrown if the callback was not sent by PonchoPay.
