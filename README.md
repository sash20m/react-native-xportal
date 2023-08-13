# React Native XPortal
![XPortal Logo](img/xportal.png)

[![npm version](https://badge.fury.io/js/[library-name].svg)](https://badge.fury.io/js/[library-name])
[![License](https://img.shields.io/badge/License-[License Name]-blue.svg)](https://opensource.org/licenses/[License Name])

> Connecting mobile apps to the MultiversX's xPortal mobile wallet.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Props](#props)
- [Examples](#examples)
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

### Core functions
#### Login
```typescript
try {
      await XPortal.login();
} catch (error: any) {
      throw new Error(error.message);
}
```
This will connect your app to user's XPortal app and his account.

### Logout
```typescript
try {
      await XPortal.logout();
} catch (error: any) {
      throw new Error(error.message);
}
```
Disconnects your app from XPortal, cleaning local connection and XPortal's.

### Sign Transactions
```typescript
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

**Make sure all the transactions have a `chainId` or none of them have (and the one set on initialization will be used).**

Transactions will be sent to XPortal where the user can sign them an then returned back to you for any use you choose. This function DOES NOT send the transaction over the MultiversX's blockchain - a better approach would be to send the signed transaction to your back-end and let it handle the broadcast and other changes that the trasanction imposes on your system. If broadcasting the transaction functionality is needed, it will be added eventually. Please see [Contributing](#contributing) if you want to add this functionality. 

// see nonces

### Sign Message
```typescript
const signedMessage = await XPortal.signMessage({message: 'Passion'});
const signature = signedMessage.getSignature().toString('hex');
```
Like signing transactions, signes a message and returns it back.

### Send Custom Request
```typescript
try {
      const response = await XPortal.sendCustomRequest({
            request: { method: WalletConnectOptionalMethodsEnum.CANCEL_ACTION, params: { action: 'string here' }}
      });
} (error: any) {
      throw new Error(error.message);
}
```
Send a custom request to XPortal, method and params need to specified in relation to your needs.

### Ping
```typescript
try {
      const isActive = await XPortal.ping();
} (error: any) {
      throw new Error(error.message);
}
```
Returns a `Boolean` to reflect the state of the connection with the XPortal. 

### Refresh Account Data
```typescript
try {
      const isActive = await XPortal.refreshAccountData();
} (error: any) {
      throw new Error(error.message);
}
```
Provides the ability to manually refresh the account data stored if there have been changes outside of your app.

### Watch Transaction
```typescript
try {
      const state = await XPortal.watchTransaction({
            transactionHash: '8d78c007750e3c137943e4de7a7df5702bb11ae6541a4864670b5cf4420cf8e5',
      });
} (error: any) {
      throw new Error(error.message);
}
```
Provides the ability to watch a any transaction's status after it was sent to the MultiversX blockchain. 

### Check Account Info functions
```typescript
const address = XPortal.getWalletAddress();
const isConnected = XPortal.isConnected();
const account = XPortal.getFullAccountInfo();
const tokens = XPortal.getAccountTokensList();
const balance = XPortal.getAccountBalance();
```
Provides different information about the state of the account.


