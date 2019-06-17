# multicast-eventer

An EventEmitter for publishing & subscribing to multicast events across a network.

## Installation

```
$ npm install multicast-eventer
```

## Setup

If you're setting up your device for the first time and running Linux, there is a handy `setupRoutes` function included in the package to set up the multicast routes.

`setup.js`

```javascript
const { setupRoutes } = require('multicast-eventer');

// add multicast route to usual network interfaces
setupRoutes();
```

Or if you know what network interface you'll be using, i.e `eth0` for ethernet or `wlan0` for WiFI, you can pass that as an argument to `setupRoutes`.

`setup.js`

```javascript
const { setupRoutes } = require('multicast-eventer');

// add multicast route to usual network interfaces
setupRoutes('wlan0');
```

## Usage

You can use this package just like any other [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter), expect the events will span devices instead of the local program:

`device-one.js`
```javascript
const { MulticastEmitter } = require('multicast-eventer');
const emitter = new MulticastEmitter();

emitter.on('test', data => console.log(`Message from ${data.device}: `, data));
emitter.on('error', console.error);
```

`device-two.js`
```javascript
const { MulticastEmitter } = require('multicast-eventer');
const emitter = new MulticastEmitter();

// the 2nd argument could be an object with anything you want
emitter.emit('test', { message: 'This could be anything' })
```

### Options

- **address** (`String`): the multicast IPv4 address to listen on (valid from 224.0.0.1 to 239.255.255.254). Default is `239.10.10.100`.
- **broadcast** (`Boolean`): When set to true, UDP packets may be sent to a local interface's broadcast address. Default is `true`.
- **loopback** (`Boolean`): When set to true, multicast packets will also be received on the local interface. Default is `false`.
- **name** (`String`): Name of the device to emit with events. Default is the hostname for the device.
- **port** (`Number`): Destination port. Default is `33333`.
- **ttl** (`Number`): Specifies the number of IP hops that a packet is allowed to travel through, specifically for multicast traffic. Default is `128`.


## Test

For now, the test is basically ensuring the TypeScript source compiles successfully.

```
$ npm test
```
