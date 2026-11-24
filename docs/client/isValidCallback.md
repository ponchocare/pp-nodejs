# isValidCallback

This method allows to validate a callback received from PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
client.isValidCallback(signature, payload);
```

## Usage

Declaration:

```ts
client.isValidCallback(signature: string, payload: string): boolean;
```

Parameters:

| Parameter | Description                             |
| --------- | --------------------------------------- |
| signature | The signature header sent by PonchoPay. |
| payload   | The raw payload as a string             |


Returns:

This method returns `true` or `false` depending on whether the callback was created by PonchoPay or not.
