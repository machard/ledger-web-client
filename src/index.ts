import { WindowPostMessageStream } from '@metamask/post-message-stream';
import { v4 as uuidv4 } from 'uuid';

class LedgerWebCLient {
  stream: WindowPostMessageStream;

  requests: { [id: string]: { resolve: Function; reject: Function } } = {};

  constructor(stream: WindowPostMessageStream) {
    this.stream = stream;

    this.stream.on('data', (data: any) => {
      this.onMessage(data);
    });
  }

  onMessage(data: any) {
    if (this.requests[data.id]) {
      if (data.err) {
        this.requests[data.id].reject(data.res);
      } else {
        this.requests[data.id].resolve(data.res);
      }
      delete this.requests[data.id];
    }
  }

  async request(type: string, method: string, args: any[]): Promise<any> {
    const id = uuidv4();
    return new Promise((resolve, reject) => {
      this.requests[id] = { resolve, reject };
      this.stream.write({
        type,
        method,
        args,
        id,
      });
    });
  }
}

export default LedgerWebCLient;
