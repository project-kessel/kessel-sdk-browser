import '@testing-library/jest-dom';
import "cross-fetch/polyfill";
// testing library types
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, TransformStream , WritableStream} from 'node:stream/web'
import { BroadcastChannel } from 'node:worker_threads';

// Setup missing Web Streams API in Node.js environment
Object.assign(global, { TextDecoder, TextEncoder, ReadableStream, TransformStream, BroadcastChannel, WritableStream });
