# initiatePayment

This method allows to initialise a payment in PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
const payment = await client.initiatePayment(init);
```

## Usage

Declaration:

```ts
client.initiatePayment(init: PaymentInit): Promise<string>;
```

Parameters:

| Parameter | Description                                                 |
| --------- | ----------------------------------------------------------- |
| init      | Payment initialisation object (Check `PaymentInit` details) |

PaymentInit:

| Parameter   | Mandatory | Type            | Description                                                         |
| ----------- | --------- | --------------- | ------------------------------------------------------------------- |
| metadata    | Yes       | string          | Any string you want to keep attached to the payment                 |
| urn         | Yes       | string          | The location Unique Reference Number                                         |
| amount      | Yes       | number          | The payable amount in pences                                        |
| email       | Yes       | string          | The user email                                                      |
| note        | No        | string          | Any note to be attached to the payment                              |
| expiry      | No        | object / string | The date you want the payment to expire (Check `DateValue` details) |
| constraints | No        | object          | Constraints for the payment (Check `Constraints` details)           |

DateValue:

A date value can be either a javascript Date object or an ISO8601 string.

Constraints:

| Parameter           | Mandatory | Type   | Description                                               |
| ------------------- | --------- | ------ | --------------------------------------------------------- |
| minimum_card_amount | No        | number | Minimum amount that must be processed with a card payment |

Returns:

This method returns a promise that will resolve into the payment URL that the user must follow to complete the payment.
