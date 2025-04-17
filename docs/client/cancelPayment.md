# cancelPayment

This method allows to cancel a Payment.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
await client.cancelPayment(paymentId, payload);
```

## Usage

Declaration:

```ts
client.cancelPayment(paymentId: string, payload: JWTPayload): Promise<void>;
```

Parameters:

| Parameter | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| paymentId | Payment ID. You can find this in the callbacks' body             |
| payload   | Parameters for the cancel to happen (Check `JWTPayload` details) |

JWTPayload:

| Parameter | Mandatory | Type   | Description                                                      |
| --------- | --------- | ------ | ---------------------------------------------------------------- |
| urn       | Yes       | string | The location Unique Reference Number                             |
| email     | Yes       | string | Email authoring the update (doesn't need to be a signed in user) |

Returns:

This method returns a promise that must be awaited but doesn't resolve into a usable value.
