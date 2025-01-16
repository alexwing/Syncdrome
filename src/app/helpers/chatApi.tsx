import axios from 'axios';

interface PythonObject {
    data: any[];
    event_data: any;
    fn_index: number;
    trigger_id: number;
    session_hash: string;
}

interface QueueData {
    msg: string;
    output: {
        data: any[][][];
    };
}

class chatApi {
    private baseUrl: string;

    constructor(private port: number) {
        this.baseUrl = `http://127.0.0.1:${this.port}`;
    }

    private generateSessionHash(): string {
        const array = new Uint32Array(5);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(val => val.toString(16)).join('');
    }
    private async joinQueue(sessionHash: string, fnIndex: number, chatData: any[]): Promise<void> {
        console.log("joinQueue:", sessionHash, fnIndex, chatData);
        const pythonObject: PythonObject = {
            data: chatData,
            event_data: null,
            fn_index: fnIndex,
            trigger_id: 46,
            session_hash: sessionHash
        };

        const url = `${this.baseUrl}/queue/join?__theme=dark`;

        try {
            await axios.post(url, pythonObject);
        } catch (error) {
            throw error;
        }
    }

    private async listenForUpdates(sessionHash: string): Promise<any> {
        const url = `${this.baseUrl}/queue/data?session_hash=${sessionHash}`;
        try {
            const response = await axios.get(url);
            const lines: string[] = response.data.split('\n');
            for (const line of lines) {
                if (line) {
                    try {
                        const data: QueueData = JSON.parse(line.slice(5));
                        if (data.msg === 'process_completed') {
                            return data.output.data[0][0][1];
                        }
                    } catch (e) {
                        // Ignore parsing errors
                    }
                }
            }
            return '';
        } catch (error) {
            throw error;
        }
    }

    async sendMessage(message: string): Promise<any> {
        const sessionHash = this.generateSessionHash();

        await this.joinQueue(sessionHash, 30, []);
        await this.listenForUpdates(sessionHash);

        await this.joinQueue(sessionHash, 31, []);
        await this.listenForUpdates(sessionHash);

        await this.joinQueue(sessionHash, 32, ["", [], "AI model default", null]);
        await this.listenForUpdates(sessionHash);

        await this.joinQueue(sessionHash, 33, ["", []]);
        await this.listenForUpdates(sessionHash);

        await this.joinQueue(sessionHash, 34, [[[message, null]], null]);
        return this.listenForUpdates(sessionHash);
    }
}

export default chatApi;