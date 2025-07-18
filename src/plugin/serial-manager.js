import {EventEmitter} from 'events';

const {SerialPort} = require('serialport');

export class SerialManager extends EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.path = null;
        this.baudRate = null;
    }

    /**
     * @method 列出系统中全部的串口
     * @returns {Promise<{path: *, manufacturer: *, serialNumber: *, vendorId: *, productId: *}[]>}
     */
    static async list() {
        const ports = await SerialPort.list();
        return ports.map(port => ({
            path: port.path,
            manufacturer: port.manufacturer,
            serialNumber: port.serialNumber,
            vendorId: port.vendorId,
            productId: port.productId
        }));
    }

    async open(path, baudRate = 9600) {
        return new Promise((resolve, reject) => {
            if (this.port && this.port.isOpen) {
                resolve('The serial port has been opened.');
            }

            this.port = new SerialPort({path, baudRate, autoOpen: false});
            this.path = path;
            this.baudRate = baudRate;

            this.port.open((err) => {
                if (err) {
                    this.port = null;
                    return reject(`open serial failed: ${err.message}`);
                }
                console.log(`serial ${path} open succeed.`);
                // this._bindReadEvents();
                resolve(`serial ${path} open succeed`);
            });

            this.port.on('open', (reason) => {
                console.log('Serial port opened');
                this._bindReadEvents();
                resolve('ok');
            });

            this.port.on('error', (err) => {
                console.error('serial error:', err.message);
                // this.emit('error', err);
                // reject(err);
            });
        });
    }

    write(data) {
        return new Promise((resolve, reject) => {
            if (!this.port || !this.port.isOpen) {
                return reject(new Error('serial port has been opened.'));
            }

            this.port.write(data, (err) => {
                if (err) return reject(new Error(`write failed: ${err.message}`));
                resolve(`write succeed: ${data}`);
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            if (!this.port) return resolve('serial is closed');

            if (!this.port.isOpen) {
                this.port = null;
                return resolve('serial is closed');
            }

            this.port.close((err) => {
                if (err) return reject(new Error(`close failed: ${err.message}`));
                console.log('now serial is closed');
                this.port = null;
                this.removeAllListeners();
                resolve('serial is closed');
            });
        });
    }

    isOpen() {
        return this.port?.isOpen ?? false;
    }

    info() {
        return {
            path: this.path,
            baudRate: this.baudRate,
            isOpen: this.isOpen()
        };
    }

    _bindReadEvents() {
        if (!this.port) return;
        this.port.on('data', (data) => {
            const text = data.toString('utf-8');
            this.emit('data', text); // ✅ 将读取的数据发送出去
        });
    }
}
