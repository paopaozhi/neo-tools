export {};

declare global {
    interface Window {
        electronAPI: {
            minimize: () => void;
            close: () => void;

            // 串口相关
            getSerialPorts: () => void;
            openSerialPort: (data) => Promise<void>;
            closeSerialPort: (data) => Promise<void>;
            readSerialPorts: (data) => void;
            writeSerialPorts: (data) => Promise<void>;
        };
    }
}