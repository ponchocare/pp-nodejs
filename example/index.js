import { Client } from '@ponchopay/pp-nodejs';
import { exit } from 'node:process';

/**
 * This file provides an example on how to use `pp-nodejs` to interact with PonchoPay.
 *
 * This example initiates a payment, waits for any input and cancels the payment.
 */

/**
 * Replace the following values with the values relevant to your account.
 *
 * You can find those values by browsing to either of the following URLs depending on the environment:
 * - Demo: https://demo.ponchopay.com/provider/admin/settings/api-integration
 * - Production: https://pay.ponchopay.com/provider/admin/settings/api-integration
 */
// Set the following value to `undefined` to connect to the production environment.
const base = 'https://demo.ponchopay.com/';

// This is the integration key assigned to you.
const key = '🤫';

// This is the location Unique Reference Number.
const urn = '🏠';

// This is the payment amount in pence. We will create a payment for £20.34.
const amount = 2034;

// This is your customer's email. They are expected to pay for this payment.
const email = 'tommy@server.com';

// This is any piece of information that you want to attach to the payment.
const metadata = JSON.stringify({ order: Math.floor(Math.random() * 1000) });

/**
 * Let's create a payment!
 */
const client = new Client(key, base);
const payment = await client.initiatePayment({ amount, metadata, urn, email });

console.log();
console.log('############################################################');
console.log('A payment has been generated. Please, go here to pay for it:');
console.log(payment);
console.log('############################################################');
console.log();

/**
 * Give some time to interact with the payment.
 */
console.log('Press [ESC] to quit. Press any key to cancel the payment');
const pressed = await new Promise(resolve => {
  process.stdin.setRawMode(true);
  process.stdin.on('data', function (chunk) {
    process.stdin.pause();
    resolve(chunk[0]);
  });
});

const ESC = 27;
if (pressed === ESC) {
  console.log('Quitting. Bye!');
  exit(0);
}

/**
 * Now, let's cancel the payment we just created, just for fun!
 */
const paymentId = payment.match(/([^/]+)$/)[1];
await client.cancelPayment(paymentId, { urn, email: 'cancel@author.com' });

console.log();
console.log('The payment has been successfully canceled!');
