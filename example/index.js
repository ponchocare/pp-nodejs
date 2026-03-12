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

const {
  verification_status,
  card_payments_enabled,
  childcare_voucher_payments_enabled,
  tax_free_childcare_payments_enabled,
} = await client.validateLocationUrn({ urn, email });
console.log(`The location is ${verification_status ? '' : 'not '}verified`);
console.log(
  `The location can ${card_payments_enabled ? '' : 'not '}process card/bank payments`,
);
console.log(
  `The location can ${childcare_voucher_payments_enabled ? '' : 'not '}process childcare voucher payments`,
);
console.log(
  `The location can ${tax_free_childcare_payments_enabled ? '' : 'not '}process tax-free childcare payments`,
);

if (!verification_status) {
  console.log('Unfortunately, the location is not ready to process payments.');
  console.log(
    "But don't worry, you can always let us know at help@ponchopay.com",
  );
  exit(1);
}

const payment = await client.initiatePayment({ amount, metadata, urn, email });

console.log();
console.log('############################################################');
console.log('A payment has been generated. Please, go here to pay for it:');
console.log(payment);
console.log('############################################################');
console.log();

/**
 * To create a payment that supports Klarna, add line_items to initiatePayment.
 * Note: The sum of all line items (amount × quantity) must equal the total payment amount.
 *
 */
const paymentWithLineItems = await client.initiatePayment({
  amount: 2034,
  metadata,
  urn,
  email,
  line_items: [
    {
      description: 'After-school club (1 week)',
      amount: 1800,
      quantity: 1,
    },
    {
      description: 'Hot lunch and snacks',
      amount: 234,
      quantity: 1,
    },
  ],
});

console.log();
console.log('############################################################');
console.log(
  'A payment that can be paid with Klarna has been generated. Please, go here to pay for it:',
);
console.log(paymentWithLineItems);
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

/**
 * Let's also cancel the Klarna payment.
 */
const klarnaPaymentId = paymentWithLineItems.match(/([^/]+)$/)[1];
await client.cancelPayment(klarnaPaymentId, {
  urn,
  email: 'cancel@author.com',
});

console.log();
console.log('The Klarna payment has also been successfully canceled!');
