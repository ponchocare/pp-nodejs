# parseCallback

Securely parses a callback received from Poncho only if the callback is verified to come from Poncho.

## How to

Import the function and use it by passing the relevant parameters:

```ts
import { createToken } from '@ponchopay/pp-nodejs';

const data = await parseCallback(key, request);
```

## Usage

Declaration:

```ts
parseCallback<T>(key: string, request: Request): Promise<T>;
```

Parameters:

| Parameter | Description                     |
| --------- | ------------------------------- |
| key       | Integration key                 |
| request   | The NodeJS request to be parsed |

Returns:

This function returns the parsed data sent from Poncho after verifying the request's legitimacy.
