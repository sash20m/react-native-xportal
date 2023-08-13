# React Native XPortal

<p align="center">
  <img src="./img/xportal.png" alt="Alternate text for image">
</p>

[![npm version](https://badge.fury.io/js/react-native-xportal.svg)](https://badge.fury.io/js/react-native-xportal)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> Connecting mobile apps to the MultiversX's xPortal mobile wallet.

## Table of Contents

- [Installation](#installation)
- [Description](#description)
- [Usage](#usage)
  - [Core Functions](#core)
    - [Login](#login)
    - [Logout](#logout)
    - [Sign Transaction](#Sign-Transactions)
    - [Sign Message](#Sign-Message)
    - [Send Custom Request](#Send-Custom-Request)
    - [Ping](#Ping)
    - [Refresh Account Data](#Refresh-Account-Data)
    - [Watch Transaction](#Watch-Transaction)
    - [Account Information](#Account-Information)
  - [UI](#UI)
    - [Props for Components](#Props-for-Components)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
npm install react-native-xportal
```
or 
```bash
yarn add react-native-xportal
```

## Description
The library works as a react-native substitute for [mx-sdk-dapp](https://github.com/multiversx/mx-sdk-dapp/tree/main), it helps a mobile app connect and interact with the XPortal wallet, including providing the necessary account information (balance, tokens, address etc) and signing transactions, messages or custom requests, thus abstracing all the processes of interacting with users' wallets. On connect, sign transaction or other actions, XPortal app will automatically be opened through deeplinking to complete the intended action. 

The library has 2 main modules: `core` and `UI`. The `core` modules gives you the functions to connect, sign transactions and other so that you can call them anywhere you need. The `UI` modules exports buttons for easy of use, they also use the `core` module under the hood.

***Note: This library has all the basic functionalities for interacting with the XPortal Wallet. New functionalities can be added - if you want to contribute, please see the [Contributing](#contributing) section.***

## Usage
The library needs to be initalized first in order to work, see example below.
```typescript
import { XPortal } from 'react-native-xportal';

const callbacks = {
      onClientLogin: async () => {
            console.log('on login');
      },
      onClientLogout: async () => {
            console.log('on logout');
      },
onClientEvent: async (event: any) => {
            console.log('event -> ', event);
      },
};

try {
      await XPortal.initialize({
            chainId: 'd',
            projectId: '<wallet connect project ID>',
            metadata: {
                  description: 'Connect with x',
                  url: '<your website>',
                  icons: ['<https://img.com/linkToIcon.png>'],
                  name: '<name>',
            },
            callbacks,
      });
} catch (error) {
      console.log(error);
}
```
You need to  have a WalletConnect project ID. To get one see: https://cloud.walletconnect.com/app. Also, make sure to have valid data in your metadata field, otherwise the XPortal app will show a "Unexpected Error" when redirecting to it for login.

### Core
#### Login
```typescript
import { XPortal } from 'react-native-xportal';

try {
      await XPortal.login();
} catch (error: any) {
      throw new Error(error.message);
}
```
This will connect your app to user's XPortal app and his account.


#### Logout
```typescript
import { XPortal } from 'react-native-xportal';

try {
      await XPortal.logout();
} catch (error: any) {
      throw new Error(error.message);
}
```
Disconnects your app from XPortal, cleaning local connection and XPortal's.


#### Sign Transactions
```typescript
import { XPortal } from 'react-native-xportal';

try {
      const data = {transactions: [{
          value: '1000000000000',
          receiver:
            'erd1ju59m5rcrulg0h87ysed5acrz08xa4pkzts0hrzy2lau3ak3ne0sauhxgx',
          sender:
            'erd1ju59m5rcrulg0h87ysed5acrz08xa4pkzts0hrzy2lau3ak3ne0sauhxgx',
          gasPrice: 1000000000,
          gasLimit: 70000,
          data: 'Zm9vZCBmb3IgY2F0cw==',
          chainId: 'D',
          nonce: 88,
          version: 1,
        }],
      // minGasLimit: 50_000 (optional)
      };

      const transactions = await XPortal.signTransactions(data);
      const signature = transactions[0].getSignature().toString('hex');
} catch (error: any) {
      throw new Error(error.message);
}
```
Transactions need to be in an array, thus being able to tolerate one or many transaction for signing.

**Make sure all the transactions have a `chainId` and the proper `nonce` value.**

Transactions will be sent to XPortal where the user can sign them an then returned back to you for any use you choose. This function DOES NOT send the transaction over the MultiversX's blockchain - a better approach would be to send the signed transaction to your back-end and let it handle the broadcast and other changes that the trasanction imposes on your system. If broadcasting the transaction functionality is needed, it will be added eventually. Please see [Contributing](#contributing) if you want to add this functionality. 


#### Sign Message
```typescript
import { XPortal } from 'react-native-xportal';

const signedMessage = await XPortal.signMessage({message: 'Passion'});
const signature = signedMessage.getSignature().toString('hex');
```
Like signing transactions, signes a message and returns it back.

### Send Custom Request
```typescript
import { XPortal } from 'react-native-xportal';

try {
      const response = await XPortal.sendCustomRequest({
            request: { method: WalletConnectOptionalMethodsEnum.CANCEL_ACTION, params: { action: 'string here' }}
      });
} (error: any) {
      throw new Error(error.message);
}
```
Send a custom request to XPortal, method and params need to specified in relation to your needs.


#### Ping
```typescript
import { XPortal } from 'react-native-xportal';

try {
      const isActive = await XPortal.ping();
} (error: any) {
      throw new Error(error.message);
}
```
Returns a `Boolean` to reflect the state of the connection with the XPortal. 


### Refresh Account Data
```typescript
import { XPortal } from 'react-native-xportal';

try {
      const isActive = await XPortal.refreshAccountData();
} (error: any) {
      throw new Error(error.message);
}
```
Provides the ability to manually refresh the account data stored if there have been changes outside of your app.


#### Watch Transaction
```typescript
import { XPortal } from 'react-native-xportal';

try {
      const state = await XPortal.watchTransaction({
            transactionHash: '8d78c007750e3c137943e4de7a7df5702bb11ae6541a4864670b5cf4420cf8e5',
      });
} (error: any) {
      throw new Error(error.message);
}
```
Provides the ability to watch a any transaction's status after it was sent to the MultiversX blockchain. 


#### Account Information
```typescript
import { XPortal } from 'react-native-xportal';

const address = XPortal.getWalletAddress();
const isConnected = XPortal.isConnected();
const account = XPortal.getFullAccountInfo();
const tokens = XPortal.getAccountTokensList();
const balance = XPortal.getAccountBalance();
```
Provides different information about the state of the account.

### UI
You can see below an example with all the UI components currently provided.
```jsx
import {
  XPortalLogin,
  XPortalLogout,
  XPortalSignMessage,
  XPortalSignTx,
} from 'react-native-xportal';

<XPortalLogin />

<XPortalLogout style={{marginTop: 20}} />

<XPortalSignTx
      style={{marginTop: 20}}
      transactions={[{
            value: '1000000000000',
            receiver:
              'erd1ju59m5rcrulg0h87ysed5acrz08xa4pkzts0hrzy2lau3ak3ne0sauhxgx',
            sender:
              'erd1ju59m5rcrulg0h87ysed5acrz08xa4pkzts0hrzy2lau3ak3ne0sauhxgx',
            gasPrice: 1000000000,
            gasLimit: 70000,
            data: 'Zm9vZCBmb3IgY2F0cw==',
            chainId: 'D',
            version: 1,
          },
        ]}
      callback={(signedTx) => doStuff(signedTx)}
/>

<XPortalSignMessage
      style={{marginTop: 20}}
      message="Passion"
      callback={(signedMessage) => doStuff(signedMessage)}
      content={<View> <Text>This is a custom content inside the button</Text> </View>}
/>
```
All buttons can be styled and the content inside can be changed with the `content` prop.
#### Props for Components
| Prop Name    | Type                  | Available for    | Description                   |
|--------------|-----------------------|------------------|-------------------------------|
| content      | `React.ReactElement`  | All components   | Replaces the content of the button.   |
| style        | `StyleProp<ViewStyle>`| All components   | Styles for the button   |
| callback     | `(res) => void`       |   `XPortalSignTx`, `XPortalSignMessage`   | Callback function to get back the result |
| transaction  | `SimpleTransactionType[]`  |   `XPortalSignTx`   | Transaction to be signed |
| message      | `string`              |  `XPortalSignMessage`   | The message to be signed |

## Roadmap
Here are some features that need to be implemented: 
 - Tests
 - Stage-linter
 - Signed Transaction log (if it is needed)
 - Transaction broadcast (if it is needed)
 - 
For more, see the [open issues](https://github.com/multiversx/mx-sdk-dapp/issues) for a list of proposed features known issues. Check out **Contributing** below to get started.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

One can contribute by creating _pull requests_, or by opening _issues_ for discovered bugs or desired features.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

