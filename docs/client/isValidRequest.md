# isValidRequest

This method allows to validate a request received from PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
await client.isValidRequest(request);
```

## Usage

Declaration:

```ts
client.isValidRequest(request: Request): Promise<bool>;
```

Parameters:

| Parameter | Description        |
| --------- | ------------------ |
| request   | The request object |


Returns:

This method returns a promise with `true` or `false` depending on whether the request was created by PonchoPay or not.
