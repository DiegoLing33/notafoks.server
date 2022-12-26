import { FoxServer, FoxServerProps } from './server';

export function createFoxServer(options?: FoxServerProps) {
    return new FoxServer(options);
}

export { FoxServer, FoxServerProps };
