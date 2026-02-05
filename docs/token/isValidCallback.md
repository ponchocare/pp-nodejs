# isValidCallback

Verifies that a request from Poncho does indeed come from Poncho and hasn't been tampered in any way.

## How to

Import the function and use it by passing the relevant parameters:

```ts
import { createToken } from '@ponchopay/pp-nodejs';

const valid = await isValidCallback(key, request);
```

## Usage

Declaration:

```ts
isValidCallback(key: string, request: Request): Promise<boolean>;
```

Parameters:

| Parameter | Description                                                  |
| --------- | ------------------------------------------------------------ |
| key       | Integration key                                              |
| request   | A NodeJS request to be validated against the integration key |

Returns:

This function returns a boolean indicating whether the request is valid or not.
