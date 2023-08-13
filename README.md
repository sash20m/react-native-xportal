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

The library has 2 main modules: [core] and [UI]. The [core] modules gives you the functions to connect, sign transactions and other so that you can call them anywhere you need. The [UI] modules exports buttons for easy of use, they also use the [core] module under the hood.

## Usage
The library needs to be initalized first in order to work, see example below.
```ts
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
            icons: [
              '<https://img.com/linkToIcon.png>',
            ],
            name: '<name>',
          },
          callbacks,
        });
      } catch (error) {
        console.log(error);
      }
```
You need to  have a WalletConnect project ID. To get one see: (https://cloud.walletconnect.com/app). Also, make sure to have valid data in your metadata field, otherwise the XPortal app will show a "Unexpected Error" when redirecting to it for login.
