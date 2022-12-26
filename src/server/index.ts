import express from 'express';
import { getLogger, Logger } from 'log4js';
import * as http from 'http';
import fileUpload from 'express-fileupload';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser, { OptionsJson, OptionsUrlencoded } from 'body-parser';
import methodOverride, { MethodOverrideOptions } from 'method-override';
import session, { SessionOptions } from 'express-session';
import figlet from 'figlet';

export const FOX_SERVER_DEFAULT_PORT = 8081;

export interface FoxServerProps {
    host?: string;
    port?: number;
}

export class FoxServer {
    protected readonly app: ReturnType<typeof express>;
    protected readonly server: http.Server;
    protected readonly logger = getLogger('server');
    protected readonly host?: string;
    protected readonly port: number;

    public constructor(props: FoxServerProps = {}) {
        this.app = express();
        this.server = http.createServer(this.app);
        this.host = props.host;
        this.port = props.port ?? FOX_SERVER_DEFAULT_PORT;

        this.logger.level = 'debug';
    }

    /**
     * Возвращает express сервер
     */
    public getExpressApp(): ReturnType<typeof express> {
        return this.app;
    }

    /**
     * Возвращает HTTP сервер
     */
    public getHttpServer(): http.Server {
        return this.server;
    }

    /**
     * Возвращает logger сервера
     */
    public getLogger(): Logger {
        return this.logger;
    }

    /**
     * Вощвращает порт
     */
    public getPort(): number {
        const address = this.getHttpServer().address();
        if (address && !(typeof address === 'string')) return address.port;
        return this.port;
    }

    /**
     * Возвращает хост
     */
    public getHost(): string | undefined {
        const address = this.getHttpServer().address();
        if (address && !(typeof address === 'string')) {
            if (address.address === '::') return 'localhost';
            return address.address;
        }
        return this.host;
    }

    /**
     * Подключает загрузчик фалов
     * @param options
     */
    public useFilesUpload(options?: fileUpload.Options): FoxServer {
        this.getExpressApp().use(
            fileUpload(
                options ?? {
                    limits: { fileSize: 50 * 1024 * 1024 },
                }
            )
        );
        this.getLogger().debug('USE: file upload');
        return this;
    }

    /**
     * Использует корсы
     * @param options
     */
    public useCors(options?: CorsOptions): FoxServer {
        this.getExpressApp().use(cors(options));
        this.getLogger().debug('USE: cors');
        return this;
    }

    /**
     * Использует cors
     * @param secret
     * @param options
     */
    public useCookieParser(
        secret?: string | string[],
        options?: cookieParser.CookieParseOptions
    ): FoxServer {
        this.getExpressApp().use(cookieParser(secret, options));
        this.getLogger().debug('USE: cookie parser');
        return this;
    }

    /**
     * Подключает парсер urlencode
     * @param options
     */
    public useBodyParserURLEncode(options?: OptionsUrlencoded): FoxServer {
        this.getExpressApp().use(bodyParser.urlencoded(options ?? { extended: true }));
        this.getLogger().debug('USE: body parser - urlencode');
        return this;
    }

    /**
     * Подключает парсер JSON
     * @param options
     */
    public useBodyParserJSON(options?: OptionsJson): FoxServer {
        this.getExpressApp().use(bodyParser.json(options));
        this.getLogger().debug('USE: body parser - json');
        return this;
    }

    /**
     * Устанавливает движок отрисовки
     *
     * app.set('views', path);
     * app.set('view engine', engine);
     *
     * @param engine
     * @param path
     */
    public useRenderEngine(engine: string, path: string): FoxServer {
        this.getExpressApp().set('views', path);
        this.getExpressApp().set('view engine', engine);
        this.getLogger().debug('USE: render engine');
        return this;
    }

    /**
     * Подключает библиотеку express-method-override
     * @param getter
     * @param options
     */
    public useMethodOverride(
        getter?: string | ((req: express.Request, res: express.Response) => string),
        options?: MethodOverrideOptions
    ): FoxServer {
        this.getExpressApp().use(methodOverride(getter, options));
        this.getLogger().debug('USE: method override');
        return this;
    }

    /**
     * Подключает библиотеку express-session
     * @param options
     */
    public useSession(options: SessionOptions | string): FoxServer {
        this.getExpressApp().use(
            session(
                typeof options === 'string'
                    ? {
                          secret: options,
                          resave: true,
                          saveUninitialized: true,
                      }
                    : options
            )
        );
        this.getLogger().debug('USE: session');
        return this;
    }

    /**
     * Подключает static директорию
     * @param url
     * @param path
     */
    public useStatic(url: string, path: string): FoxServer {
        this.getExpressApp().use(url, express.static(path));
        this.getLogger().debug('USE: static');
        return this;
    }

    /**
     * Запускает HTTP сервер
     */
    public start(): Promise<FoxServer> {
        console.log(
            figlet.textSync('FOX SERVER', {
                font: 'Soft',
                verticalLayout: 'fitted',
            })
        );

        this.getLogger().info('Запуск сервера...');
        return new Promise<FoxServer>((resolve) => {
            this.getHttpServer().listen(
                {
                    port: this.port,
                    host: this.host,
                },
                () => {
                    this.getLogger().info(
                        `Сервер запущен: http://${this.getHost()}:${this.getPort()}`
                    );
                    resolve(this);
                }
            );
        });
    }
}
