# pp-nodejs

Tools to integrate PonchoPay on NodeJS

## Installation

Install it from `npm`:

```bash
npm i @ponchopay/pp-nodejs
```

## Usage

This package declares 2 objects:

### createToken: function

Importing:

```js
import { createToken } from '@ponchopay/pp-nodejs';
```

Parameters:

| Parameter | Mandatory | Type   | Description                                          |
| --------- | --------- | ------ | ---------------------------------------------------- |
| key       | Yes       | string | Integration key                                      |
| metadata  | Yes       | string | Any string you want to keep saved within the payment |

Returns:
It returns an string containing the token to be used to initate a payment

### Client: class

Importing:

```js
import { Client } from '@ponchopay/pp-nodejs';
```

Constructor:

| Parameter | Mandatory | Type   | Description                                                    |
| --------- | --------- | ------ | -------------------------------------------------------------- |
| key       | Yes       | string | Integration key                                                |
| base      | No        | string | Base PonchoPay URL to use. Default: https://pay.ponchopay.com/ |

Methods:

**initiatePayment**:

Parameters:

| Parameter | Mandatory | Type   | Description                   |
| --------- | --------- | ------ | ----------------------------- |
| init      | Yes       | object | Payment initialisation object |

The payment initialisation object is defined as follows:

| Parameter | Mandatory | Type           | Description                                          |
| --------- | --------- | -------------- | ---------------------------------------------------- |
| metadata  | Yes       | string         | Any string you want to keep saved within the payment |
| urn       | Yes       | string         | The Unique Reference Number                          |
| amount    | Yes       | number         | The payable amount in pences                         |
| email     | Yes       | string         | The user email                                       |
| note      | No        | string         | Any note to be attached to the payment               |
| expiry    | No        | Date or string | The date you want the payment to expire              |

Returns:
It returns the URL the user needs to use to make the payment.

## Development

### Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

### Testing

To ensure the project is bug-free, run

```bash
npm run test
```
