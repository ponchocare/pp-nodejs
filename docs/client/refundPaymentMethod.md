# refundPaymentMethod

This method allows to fully or partially refund a Payment Method.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
await client.refundPaymentMethod(paymentMethodId, refund);
```

## Usage

Declaration:

```ts
client.refundPaymentMethod(paymentMethodId: string, refund: PaymentMethodRefund): Promise<void>;
```

Parameters:

| Parameter       | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| paymentMethodId | Payment method ID. You can find this in the callbacks' body               |
| refund          | Parameters for the refund to happen (Check `PaymentMethodRefund` details) |

PaymentMethodRefund:

| Parameter | Mandatory | Type   | Description                                                                            |
| --------- | --------- | ------ | -------------------------------------------------------------------------------------- |
| urn       | Yes       | string | The location Unique Reference Number                                                   |
| email     | Yes       | string | Email authoring the update (doesn't need to be a signed in user)                       |
| amount    | Yes       | name   | The amount to be refunded. Can't be greather than the remaining amount in the payment. |

Returns:

This method returns a promise that must be awaited but doesn't resolve into a usable value.
