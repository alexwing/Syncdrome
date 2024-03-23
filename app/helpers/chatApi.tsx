import * as request from 'request';
import * as crypto from 'crypto';

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
        return crypto.randomBytes(5).toString('hex');
    }

    private joinQueue(sessionHash: string, fnIndex: number, chatData: any[]): Promise<void> {
        console.log("joinQueue");
        return new Promise((resolve, reject) => {
            const pythonObject: PythonObject = {
                data: chatData,
                event_data: null,
                fn_index: fnIndex,
                trigger_id: 46,
                session_hash: sessionHash
            };

            const jsonString = JSON.stringify(pythonObject);

            const url = `${this.baseUrl}/queue/join?__theme=dark`;

            request.post(url, { body: jsonString }, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    private async listenForUpdates(sessionHash: string): Promise<any> {
        const url = `${this.baseUrl}/queue/data?session_hash=${sessionHash}`;
        return new Promise((resolve, reject) => {
            request.get(url, { json: true }, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    const lines: string[] = body.split('\n');
                    for (const line of lines) {
                        if (line) {
                            try {
                                const data: QueueData = JSON.parse(line.slice(5));
                                if (data.msg === 'process_completed') {
                                    resolve(data.output.data[0][0][1]);
                                    return;
                                }
                            } catch (e) {
                                // Ignore parsing errors
                            }
                        }
                    }
                    resolve('');
                }
            });
        });
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