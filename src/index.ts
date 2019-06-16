import createDebugger from 'debug';
import {createSocket, Socket} from 'dgram';
import {EventEmitter} from 'events';
import {execSync as exec} from 'child_process';
import {hostname} from 'os';

const debug = createDebugger('multicast-eventer');

export function setupRoutes(iface?: string) {
  if (iface) {
    try {
      exec(`route add -net 224.0.0.0/4 dev ${iface}`);
    } catch (error) {
      debug(`Multicast ${iface} route already created`);
    }

    return true;
  }

  try {
    exec('route add -net 224.0.0.0/4 dev wlan0');
  } catch (error) {
    debug('Multicast wlan0 route already created');
  }

  try {
    exec('route add -net 224.0.0.0/4 dev eth0');
  } catch (error) {
    debug('Multicast eth0 route already created');
  }

  return true;
}

const PORT = 33333;
const MULTICAST_ADDRESS = '239.10.10.100';
const TTL = 128;

export interface ConstructorOptions {
  address?: string;
  broadcast?: boolean;
  loopback?: boolean;
  name?: string;
  port?: number;
  ttl?: number;
}

export class MulticastEmitter extends EventEmitter {
  public address: string;
  public device: string;
  public port: number;
  private pub: Socket;

  constructor({
    address = MULTICAST_ADDRESS,
    broadcast = true,
    loopback = false,
    name,
    port = PORT,
    ttl = TTL,
  }: ConstructorOptions = {}) {
    super();

    this.port = port;
    this.address = address;
    this.device = name || hostname();
    this.pub = createSocket('udp4');

    this.pub.bind(port, () => {
      this.pub.setBroadcast(broadcast);
      this.pub.setMulticastLoopback(loopback);
      this.pub.setMulticastTTL(ttl);

      try {
        this.pub.addMembership(address);
      } catch (error) {
        super.emit('error', error);
      }

      debug(
        `${this.device} is ready to emit events to address: ${this.address}:${
          this.port
        }`,
      );
    });

    this.pub.on('message', (message, remote) => {
      debug(`Message from: ${remote.address}:${remote.port}`);
      try {
        const data = JSON.parse(message.toString());
        if (data.device !== this.device) {
          super.emit(data.event, data);
        }
      } catch (error) {
        super.emit('error', error);
      }
    });
  }

  emit(event: string, data: object = {}) {
    const payload = JSON.stringify(
      Object.assign({}, data, {
        device: this.device,
        event: event,
      }),
    );

    this.pub.send(
      Buffer.from(payload),
      0,
      payload.length,
      this.port,
      this.address,
    );

    return true;
  }
}

module.exports = MulticastEmitter;
