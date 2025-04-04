# initiateSubscription

This method allows to initialise a subscription in PonchoPay.

## How to

Import the client and call the method by passing the relevant parameters:

```ts
import { Client } from '@ponchopay/pp-nodejs';

const client = new Client(key);
const payment = await client.initiateSubscription(init);
```

## Usage

Declaration:

```ts
client.initiateSubscription(init: SubscriptionInit): Promise<string>;
```

Parameters:

| Parameter | Description                                                      |
| --------- | ---------------------------------------------------------------- |
| init      | Payment initialisation object (Check `SubscriptionInit` details) |

SubscriptionInit:

| Parameter                   | Mandatory | Type   | Description                                                          |
| --------------------------- | --------- | ------ | -------------------------------------------------------------------- |
| urn                         | Yes       | string | The location Unique Reference Number                                 |
| amount                      | Yes       | number | The payable amount in pences for each generated payment              |
| metadata                    | Yes       | string | Any string you want to keep attached to the subscription             |
| email                       | Yes       | string | The user email                                                       |
| repetition                  | Yes       | object | The frequency to generate payments (Check `Repetition` details)      |
| ending                      | No        | object | The condition to terminate the subscription (Check `Ending` details) |
| note                        | No        | string | Any note to be attached to the subscription                          |
| additional_one_time_payment | No        | object | An additional one time payment (Check `OneTimePayment` details)      |

Repetition:

| Parameter   | Mandatory | Type   | Description                                                                           |
| ----------- | --------- | ------ | ------------------------------------------------------------------------------------- |
| granularity | Yes       | string | The time span range. It can be `daily`, `weekly`, `monthly`, or `yearly`              |
| period      | Yes       | number | The amount of granularity before the next payment is generated.                       |
| weekdays    | Maybe     | set    | If granularity is `weekly`, this must contain a set with values from the Weekday enum |
| day         | Maybe     | number | If granularity is `monthly`, this must contain the day of the month                   |

Ending:

| Parameter   | Mandatory | Type            | Description                                                                          |
| ----------- | --------- | --------------- | ------------------------------------------------------------------------------------ |
| condition   | Yes       | string          | The termination condition. It can be `never`, `occurrences`, or `date`               |
| occurrences | Maybe     | number          | If condition is `occurrences`, this must contain the number of payments to terminate |
| date        | Maybe     | object / string | If condition is `date`, this must contain the date (Check `DateValue` details)       |

OneTimePayment:

| Parameter   | Mandatory | Type            | Description                                                         |
| ----------- | --------- | --------------- | ------------------------------------------------------------------- |
| metadata    | Yes       | string          | Any string you want to keep attached to the payment                 |
| amount      | Yes       | number          | The payable amount in pences                                        |
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

This method returns a promise that will resolve into the subscription URL that the user must follow to set up the subscription.
