# createJWT

This function allows the creation of JWTs for the payment manipulation endpoints.

## How to

Import the function and use it by passing the relevant parameters:

```ts
import { createJWT } from '@ponchopay/pp-nodejs';

const jwt = await createJWT(urn, key, email, data);
```

## Usage

Declaration:

```ts
createJWT(urn: string, key: string, email: string, data: string): Promise<string>;
```

Parameters:

| Parameter | Description                                                         |
| --------- | ------------------------------------------------------------------- |
| urn       | The Unique Reference Number                                         |
| key       | Integration key                                                     |
| email     | Email authoring the sent data (doesn't need to be a signed in user) |
| data      | The data to be sent                                                 |

Returns:

This function returns a promise that will resolve into the JWT to be sent to PonchoPay for the request authorisation.
