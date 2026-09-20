# pp-nodejs

Tools to integrate PonchoPay on NodeJS

## Installation

Install it from `npm`:

```bash
npm i @ponchopay/pp-nodejs
```

You can also use your favourite package manger like `yarn` or `pnpm`.

## Usage

This package declares the following functions:
- [createToken](https://github.com/ponchocare/pp-nodejs/blob/master/docs/token/createToken.md): This function allows the creation of tokens for the initialisation endpoints.
- [createJWT](https://github.com/ponchocare/pp-nodejs/blob/master/docs/token/createJWT.md): This function allows the creation of JWTs for the payment manipulation endpoints.

And the `Client` class which provides the following methods:
- [validateLocationUrn](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/validateLocationUrn.md): This method allows to validate a location to ensure it is ready to process payments.
- [initiatePayment](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/initiatePayment.md): This method allows to initialise a payment in PonchoPay.
- [initiateSubscription](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/initiateSubscription.md): This method allows to initialise a subscription in PonchoPay.
- [updatePaymentMethod](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/updatePaymentMethod.md): This method allows to change the Payment Method properties.
- [refundPaymentMethod](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/refundPaymentMethod.md): This method allows to fully or partially refund a Payment Method.
- [cancelPayment](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/cancelPayment.md): This method allows to cancel a Payment.
- [cancelRecursion](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/cancelRecursion.md): This method allows to cancel a Recurring Payment.
- [isValidCallback](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/isValidCallback.md): This method allows to validate a callback received from PonchoPay.
- [isValidRequest](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/isValidRequest.md): This method allows to validate a request received from PonchoPay.
- [parsedCallback](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/parseCallback.md): This method allows to parse a callback received from PonchoPay.
- [parseRequest](https://github.com/ponchocare/pp-nodejs/blob/master/docs/client/parseRequest.md): This method allows to parse a request received from PonchoPay.

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
