export = Moysklad

/**
 * Создает экземпляр клиента для работы с API МойСклад
 * @param options Параметры инициализации экземпляра
 */
declare function Moysklad(options?: Moysklad.Options): Moysklad.Instance

declare namespace Moysklad {
  export type RetryFunction = <U, T extends (...args: any[]) => Promise<U>>(
    thunk: T,
    signal?: AbortSignal | undefined
  ) => Promise<U>

  export interface Instance {
    /**
     * Выполняет GET запрос по указанному ресурсу
     *
     * @param path Путь к ресурсу
     * @param query Строка запроса
     * @param options Опции запроса
     */
    GET(
      path: string,
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    GET(
      path: string[],
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    GET(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Строка запроса */
      query?: Query | null | undefined
      /** Опции запроса */
      options?: RequestOptions | undefined
    }): Promise<any>

    /**
     * Выполняет POST запрос по указанному ресурсу
     *
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    POST(
      path: string,
      payload: any,
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    POST(
      path: string[],
      payload: any,
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    POST(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: any
      /** Строка запроса */
      query?: Query | null | undefined
      /** Опции запроса */
      options?: RequestOptions | undefined
    }): Promise<any>

    /**
     * Выполняет PUT запрос по указанному ресурсу
     *
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    PUT(
      path: string,
      payload: any,
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    PUT(
      path: string[],
      payload: any,
      query?: Query | null | undefined,
      options?: RequestOptions | undefined
    ): Promise<any>

    /** @deprecated */
    PUT(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: any
      /** Строка запроса */
      query?: Query | null | undefined
      /** Опции запроса */
      options?: RequestOptions | undefined
    }): Promise<any>

    /**
     * Выполняет DELETE запрос по указанному ресурсу
     *
     * @param path Путь к ресурсу
     * @param options Опции запроса
     */
    DELETE(path: string, options?: RequestOptions): Promise<any>

    /** @deprecated */
    DELETE(path: string[], options?: RequestOptions): Promise<any>

    /** @deprecated */
    DELETE(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Опции запроса */
      options?: RequestOptions | undefined
    }): Promise<any>

    /**
     * Возвращает параметры с которыми был инициализирован текущий клиент
     *
     * Пример:
     * ```js
     * const ms = Moysklad({ apiVersion: '1.2' })
     *
     * const options = ms.getOptions()
     *
     * console.log(options)
     * // { endpoint: "https://api.moysklad.ru/api", api: "remap", apiVersion: "1.2", fetch }
     *
     * ```
     */
    getOptions(): Options

    /**
     * Возвращает текущую версию библиотеки.
     *
     * Версия из package.json (поле `version`)
     */
    getVersion(): string

    /**
     * Возвращает полный url для указанных параметров
     *
     * @param path Путь к ресурсу или href
     * @param query Параметры строки запроса
     *
     * Пример:
     *
     * ```js
     * ms.buildUrl('entity/customerorder', { expand: 'agent' })
     * // https://api.moysklad.ru/api/remap/1.2/entity/customerorder?expand=agent
     * ```
     */
    buildUrl(path: string, query?: Query): string

    /**
     * @deprecated Для передачи параметра `path` используйте строку
     */
    buildUrl(path: string[], query?: Query): string

    /**
     * Разбирает url ресурса API МойСклад на составные части
     *
     * @param url url, path или ref ресурса API МойСклад
     *
     * - url `https://...`
     * - ref `"path/to"`
     * - (deprecated) path `["path", "to"]`
     */
    parseUrl(url: string): {
      /**
       * Точка доступа к API
       *
       * Пример: `https://api.moysklad.ru/api`
       */
      endpoint: string

      /**
       * Раздел API
       *
       * Пример: `remap`
       */
      api: string

      /**
       * Версия API
       *
       * Пример: `1.2`
       */
      apiVersion: string

      /**
       * Составные части пути к ресурсу
       *
       * Пример: `["entity", "customerorder"]`
       */
      path: string[]

      /**
       * Параметры строки запроса
       *
       * Пример: `{"expand": "agent"}`
       */
      query: Query
    }

    /**
     * Выполняет запрос по указанному url и возвращает результат
     *
     * @param url url ресурса
     * @param options Параметры запроса
     *
     * Пример:
     * ```js
     * const url = `https://api.moysklad.ru/api/remap/1.2/entity/customerorder/eb7bc422-ae8d-11e3-9e32-002590a28eca`
     *
     * const patch = { applicable: false }
     *
     * const updatedOrder = await ms.fetchUrl(url, {
     *  method: 'PUT',
     *  body: JSON.stringify(patch)
     * })
     * ```
     */
    fetchUrl(url: string, options?: RequestOptions): Promise<any>

    /**
     * Возвращает значение HTTP заголовка Authorization
     */
    getAuthHeader(): string
  }

  /**
   * Параметры инициализации экземпляра клиента
   */
  export interface Options {
    /**
     * Функция с интерфейсом [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API).
     *
     * По умолчанию используется глобальный fetch (если глобальный fetch не
     * найден, то при первом запросе будет выброшена ошибка).
     *
     * Для управления потоком запросов с целью уложиться в [ограничения](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-ogranicheniq)
     * API МойСклад можно использовать модуль [moysklad-fetch-planner](https://www.npmjs.com/package/moysklad-fetch-planner).
     * Модуль считывает информацию о текущих лимитах из заголовков ответов API
     * МойСклад и ограничивает скорость выполнения запросов, предотвращая появления
     * ошибок 429 Too Many Requests. В случае если ошибки 429 избежать не удалось,
     * запрос будет повторен при восстановлении доступного лимита.
     *
     * Пример использования:
     *
     * ```ts
     * import Moysklad from 'moysklad'
     * import { fetch } from 'undici'
     * import { wrapFetchApi } from 'moysklad-fetch-planner'
     *
     * const ms = Moysklad({ fetch: wrapFetchApi(fetch) })
     * ```
     */
    fetch?: any

    /**
     * Функция для управления поведением при возникновении ошибок.
     *
     * В функцию `retry` передается аргумент - `thunk`. `thunk` - асинхронная
     * функция без аргументов, при выполнении которой выполняется текущий
     * HTTP-запрос.
     *
     * Логика внутри функции `retry` должна возвращать результат выполнения
     * функции `thunk`, там же обрабатываются ошибки и при необходимости
     * повторяется выполнение запроса через повторный вызов `thunk`.
     *
     * Можно использовать готовые модули в которых уже реализована стратегия
     * повторения запросов.
     *
     * Пример с применением модуля [p-retry](https://github.com/sindresorhus/p-retry):
     *
     * ```ts
     * import Moysklad from 'moysklad'
     * import pRetry from 'p-retry'
     *
     * const ms = Moysklad({
     *   retry: (thunk, signal) => {
     *     return pRetry(thunk, {
     *       retries: 2,
     *       shouldRetry: Moysklad.shouldRetryError,
     *       onFailedAttempt: error => {
     *         console.log(
     *           `Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`
     *         )
     *       },
     *       signal
     *     })
     *   }
     * })
     * ```
     *
     * Для обработки ошибок `429 Too Many Requests` рекомендуется использовать модуль
     * планировщик запросов [moysklad-fetch-planner](https://www.npmjs.com/package/moysklad-fetch-planner)
     * (см. описание опции `fetch`). Использование планировщика можно совмещать с
     * опцией `retry`.
     *
     * [Пример настройки](https://github.com/wmakeev/moysklad/blob/master/examples/retry.js) клиента с retry и планировщиком.
     */
    retry?: RetryFunction

    /**
     * Точка доступа к API
     *
     * по умолчанию `https://api.moysklad.ru/api`
     */
    endpoint?: string

    /**
     * Раздел API
     *
     * по умолчанию `remap`
     */
    api?: string

    /**
     * Версия API
     *
     * по умолчанию `1.2`
     */
    apiVersion?: string

    /**
     * Токен для доступа к API
     *
     * Можно передать через глобальную переменную или переменную окружения `MOYSKLAD_TOKEN`
     * (см. [Аутентификация](https://github.com/wmakeev/moysklad#аутентификация))
     */
    token?: string

    /**
     * Логин
     *
     * Можно передать через глобальную переменную или переменную окружения `MOYSKLAD_LOGIN`
     * (см. [Аутентификация](https://github.com/wmakeev/moysklad#аутентификация))
     */
    login?: string

    /**
     * Пароль
     *
     * Можно передать через глобальную переменную или переменную окружения `MOYSKLAD_PASSWORD`
     * (см. [Аутентификация](https://github.com/wmakeev/moysklad#аутентификация))
     */
    password?: string

    /**
     * Экземпляр [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) для получения событий
     *
     * Пример использования:
     *
     * ```js
     * const { fetch } = require('undici')
     * const { EventEmitter } = require('events')
     *
     * const Moysklad = require('..')
     *
     * const emitter = new EventEmitter()
     *
     * const ms = Moysklad({ fetch, emitter })
     *
     * const startTime = Date.now()
     *
     * emitter
     *   .on('request', ({ requestId, url, options }) => {
     *     console.log(`${options.method} ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('response', ({ requestId, url, options: { method }, response: { statusText, status } }) => {
     *     console.log(`${method} ${statusText} ${status} ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('response:body', ({ requestId, url, options: { method }, response, body }) => {
     *     console.log(`${method} BODY ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('error', (error, { requestId }) => {
     *     console.log(error, requestId)
     *   })
     *
     * ms.GET('entity/customerorder', { limit: 1 }).then(res => {
     *   console.log('Order name: ' + res.rows[0].name)
     * })
     * ```
     *
     * Вывод в консоли:
     *
     * ```text
     * GET https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+4ms)
     * GET OK 200 https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+575ms)
     * GET BODY https://api.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+580ms)
     * Order name: 00600
     * ```
     *
     */
    emitter?: any

    /**
     * Содержимое заголовка "User-Agent" при выполнении запроса.
     *
     * Удобно использовать для контроля изменений через API на вкладке "Аудит".
     *
     * По умолчанию: `moysklad/{version} (+https://github.com/wmakeev/moysklad)`
     */
    userAgent?: string

    [option: string]: any
  }

  /**
   * Все опции переданные в объекте `options` (за исключением вспомогательных) передаются напрямую
   * в опции метода `fetch` ([Fetch API](http://github.github.io/fetch/)) при осуществлении запроса.
   */
  export interface RequestOptions {
    /**
     * Если `true`, то метод вернет результат запроса в виде объекта
     * [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
     *
     * Если ответ содержит ошибку, то вам её нужно обработать вручную.
     *
     * Если `true`, то опции `muteApiErrors` и `muteCollectionErrors` не учитываются.
     */
    rawResponse?: boolean

    /**
     * Если ответ сервера с кодом в диапазоне 300-399 (редирект), то будет
     * выброшена ошибка [MoyskladUnexpectedRedirectError](https://github.com/wmakeev/moysklad?tab=readme-ov-file#moyskladunexpectedredirecterror),
     * поэтому, для явной обработки редиректа необходимо указать опцию `rawRedirect` со
     * значением `true`. В этом случае метод вернет объект
     * [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response),
     * из которого можно получить Location заголовок.
     *
     * Такое поведение сработает,
     * только если явно не указана опция [redirect](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#redirect)
     * со значением `follow`.
     */
    rawRedirect?: boolean

    /**
     * Если `true`, то метод вернет массив из двух элементов - результат и
     * исходный объект [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response).
     * Ошибки будут обработаны как при обычном запросе.
     */
    includeResponse?: boolean

    /**
     * Если `true`, то все ошибки API (тип ошибки `MoyskladApiError`) будут проигнорированы.
     *
     * Ошибка `MoyskladApiError` генерируется в случаях:
     * - если код ответа сервера не 2xx и тело ответа содержит поле `errors`
     * - если ответ коллекция и хотя бы один элемент коллекции содержит поле `errors`
     *
     * Результат будет содержать ответ сервера с ошибкой или коллекцию.
     *
     * Ошибка сервера или протокола проигнорированы не будут.
     *
     * Опция полезна, если вы хотите самостоятельно обрабатывать ошибки API МойСклад.
     *
     * Пример (одна ошибка):
     *
     * ```js
     * const result = await ms.GET('foo', null, { muteApiErrors: true })
     *
     * if (result.errors) {
     *   console.log(result.errors[0].error)
     * }
     * ```
     *
     * Пример (ошибка в коллекции):
     *
     * ```js
     * const result = await ms.POST('entity/demand', [demands], {
     *   muteApiErrors: true
     * })
     *
     * if (Array.isArray(result)) {
     *   const errors = result.filter(it => it.errors)
     *
     *   if (errors.length) {
     *     throw new Error('В коллекции есть ошибки')
     *   }
     * } else if (result.errors) {
     *   throw new Error(result.errors[0].error)
     * }
     * ```
     *
     * @see `muteCollectionErrors`
     */
    muteApiErrors?: boolean

    /**
     * @deprecated используйте `muteApiErrors`
     */
    muteErrors?: boolean

    /**
     * Если `true`, то будут проигнорированы ошибки внутри коллекций.
     *
     * Если ответ коллекция и хотя бы один элемент коллекции содержит поле `errors`,
     * то ошибка `MoyskladApiError` выброшена не будет.
     *
     * Пример (ошибка в коллекции):
     *
     * ```js
     * const result = await ms.POST('entity/demand', [demands], {
     *   muteCollectionErrors: true
     * })
     *
     * const errors = result.filter(it => it.errors)
     *
     * if (errors.length) {
     *   throw new Error('В коллекции есть ошибки')
     * }
     * ```
     */
    muteCollectionErrors?: boolean

    /**
     * Если `true`, то в запрос будет включен заголовок `X-Lognex-Precision` со значением `true`
     * (отключение округления цен и себестоимости до копеек).
     */
    precision?: boolean

    /**
     * Если `true`, то в запрос будет включен заголовок `X-Lognex-WebHook-Disable`
     * со значением `true` (отключить уведомления вебхуков в контексте данного запроса).
     *
     * @deprecated Не рекомендуется использовать данную опцию, применяйте `webHookDisableByPrefix`.
     */
    webHookDisable?: boolean

    /**
     * Префикс url для выборочного отключения вебхуков, будет добавлен в
     * качестве значения заголовка `X-Lognex-WebHook-DisableByPrefix`.
     */
    webHookDisableByPrefix?: string

    /**
     * В JSON API для скачивания файла формируется редирект на временный URL
     * файла. Для корректной работы необходимо поддерживать обработку
     * перенаправлений запросов.
     * Запрос на временный URL не требует авторизации. По умолчанию время жизни
     * временного URL равно одной минуте.
     *
     * C помощью параметра можно изменить время жизни URL в секундах. Текущее
     * максимально возможное значение - 86400 секунд (24 часа). Долгоживущие
     * ссылки предназначены для экспорта. Использование этих ссылок на публично
     * доступных web-страницах запрещено.
     *
     * [Ссылки на файлы](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-obschie-swedeniq-ssylki-na-fajly)
     */
    downloadExpirationSeconds?: number

    /**
     * Можно добавить дополнительные заголовки запроса
     */
    headers?: {
      [header: string]: string | number
    }

    /**
     * Обработка редиректа
     *
     * Установите `follow`, если нужно автоматически обрабатывать редирект `3xx`.
     * Например при запросе товара по Id из приложения МойСклад
     *
     * default: `manual`
     */
    redirect?: 'manual' | 'follow' | 'error'

    [option: string]: any
  }

  export type QueryValue = string | number | boolean | Date

  export interface QueryObject {
    /**
     * Равно `key=value`
     */
    $eq?: QueryValue | undefined

    /**
     * Не равно `key!=value`
     */
    $ne?: QueryValue | undefined

    /**
     * Больше `key>value`
     */
    $gt?: QueryValue | undefined

    /**
     * Больше или равно `key>=value`
     */
    $gte?: QueryValue | undefined

    /**
     * Меньше `key<value`
     */
    $lt?: QueryValue | undefined

    /**
     * Меньше или равно `key<=value`
     */
    $lte?: QueryValue | undefined

    /**
     * Начинается со строки `key~=value`
     */
    $st?: QueryValue | undefined

    /**
     * Заканчивается строкой `key=~value`
     */
    $et?: QueryValue | undefined

    /**
     * Содержит строку `key~value`
     */
    $contains?: QueryValue | undefined

    /**
     * Входит в `key=value1;key=value2;...`
     */
    $in?: QueryValue[] | undefined

    /**
     * Не входит `key!=value1;key!=value2;...`
     */
    $nin?: QueryValue[] | undefined

    /**
     * Наличие значения (не null)
     *
     * - `true` - `key!=`
     * - `false` - `key=`
     */
    $exists?: boolean | undefined

    /**
     * Объединение нескольких условий
     *
     * Оба фильтра ниже идентичны:
     *
     * ```js
     * const filter1 = {
     *   name: {
     *     $all: [
     *       { $eq: 'foo' },
     *       {
     *         $not: {
     *           $eq: 10,
     *           $in: [5, 6]
     *         }
     *       }
     *     ]
     *   }
     * }
     *
     * const filter2 = {
     *   name: {
     *     $eq: 'foo',
     *     $not: {
     *       $eq: 10,
     *       $in: [5, 6]
     *     }
     *   }
     * }
     * ```
     */
    $all?: QueryObject[] | undefined

    /**
     * Отрицание условия
     */
    $not?: QueryObject | undefined

    /**
     * Равно `key=value`
     */
    [key: string]:
      | QueryValue
      | QueryValue[]
      | QueryObject
      | QueryObject[]
      | undefined
  }

  export type QueryFilter = {
    [key: string]: QueryValue | QueryValue[] | QueryObject | undefined
  }

  export type QueryOrder = Array<string | [string] | [string, string]>

  /**
   * Параметры запроса
   *
   * Все поля объекта преобразуются в соответствующую строку запроса url. Некоторые поля (поле `filter`) подвергаются преобразованию.
   */
  export interface Query {
    /**
     * Используется для фильтрации элементов коллекции
     *
     * ```js
     * const filter = {
     *    applicable: true,
     *    moment: {
     *      $gt: '2019-08-10 11:00'
     *    }
     * }
     * ```
     */
    filter?: QueryFilter | string | undefined

    /** TODO */
    search?: string | undefined

    /**
     * Используется для раскрытия ссылок на связанные объекты
     *
     * Пример: `agent,positions.assortment`
     *
     * Если указан `expand` и не указан `limit`, то `limit` будет автоматически установлен как `100`
     */
    expand?: string | undefined

    /**
     * Задает ограничение на кол-во возвращаемых элементов в коллекции
     *
     * Если указан `expand` и не указан `limit`, то `limit` будет автоматически установлен как `100`
     */
    limit?: number | undefined

    /** Задает смещение для первого элемента в коллекции */
    offset?: number | undefined

    /**
     * Сортировка выборки
     *
     * Примеры:
     * - `name` или `['name']`
     * - `code,desc` или `[['code','desc']]`
     * - `name;code,desc` или `['name', ['code','desc']]`
     * - `name,desc;code,asc` или `['name,desc', ['code','asc']]`
     */
    order?: QueryOrder | string | undefined

    /**
     * Запустить запрос в [асинхронном режиме](https://dev.moysklad.ru/doc/api/remap/1.2/workbook/#workbook-rabota-s-asinhronnym-obmenom).
     * Асинхронный обмен предоставляет возможность получать результаты длительных запросов асинхронно, не используя многократные запросы с листанием.
     *
     * Параметры запроса limit и offset указывать не нужно, так как отчет будет построен полностью.
     *
     * [Список запросов](https://dev.moysklad.ru/doc/api/remap/1.2/#mojsklad-json-api-asinhronnyj-obmen), которые могут быть выполнены асинхронно
     *
     * Пример:
     *
     * ```js
     * const resp = await ms.GET(
     *   'entity/assortment',
     *   {
     *     filter: {
     *       "stockStore": {
     *         "$in": [
     *           "https://api.moysklad.ru/api/remap/1.2/entity/store/b63b4250-ad44-11e9-912f-f3d4000759d7"
     *         ]
     *       },
     *       "stockMode": {
     *         "$eq": "positiveOnly"
     *       }
     *     },
     *     async: true
     *   },
     *   { rawResponse: true }
     * )
     *
     * if (resp.status !== 202) {
     *   throw new Error('Ожидался ответ асинхронной задачи с кодом 202')
     * }
     *
     * const statusUrl = resp.headers.get('Content-Location')
     * const resultUrl = resp.headers.get('Location')
     *
     * // ... проверка статуса запроса по ссылке statusUrl и получение результата по ссылке resultUrl
     *
     * ```
     */
    async?: boolean

    [key: string]: any
  }

  /**
   * Возвращает текущую версию библиотеки.
   *
   * Версия из package.json (поле `version`)
   */
  export function getVersion(): string

  /**
   * Преобразует дату в строку в формате API МойСклад в часовом поясе Москвы
   * @param date дата
   * @param includeMs если `true`, то в результирующую дату будут включены миллисекунды
   */
  export function getTimeString(
    date: Date | number,
    includeMs?: boolean
  ): string

  /**
   * Преобразует строку с датой в формате API МойСклад в объект даты (с учетом часового пояса исходной даты)
   * @param date дата в формате МойСклад (напр. `2017-04-08 13:33:00.123`)
   */
  export function parseTimeString(date: string): Date

  /**
   * Разбирает url ресурса API МойСклад на составные части
   *
   * @param url url, path или ref ресурса API МойСклад
   *
   * - url `https://...`
   */
  export function parseUrl(url: string): {
    /**
     * Точка доступа к API
     *
     * Пример: `https://api.moysklad.ru/api`
     */
    endpoint: string

    /**
     * Раздел API
     *
     * Пример: `remap`
     */
    api: string

    /**
     * Версия API
     *
     * Пример: `1.2`
     */
    apiVersion: string

    /**
     * Составные части пути к ресурсу
     *
     * Пример: `["entity", "customerorder"]`
     */
    path: string[]

    /**
     * Параметры строки запроса
     *
     * Пример: `{"expand": "agent"}`
     */
    query: Query
  }

  /**
   * Формирует не закодированную строку фильтра
   *
   * ```js
   * Moysklad.buildFilter({ name: { $st: 'foo' } })
   * // 'code=123;name~=foo'
   * ```
   *
   * @param filter Объект фильтра
   */
  export function buildFilter(filter: QueryFilter): string

  /**
   * Формирует строку с параметрами запроса
   *
   * ```js
   * Moysklad.buildQuery({
   *  filter: { name: 'foo' },
   *  limit: 100,
   *  foo: 'bar'
   * })
   *
   * // 'filter=name%3Dfoo&limit=100&foo=bar'
   * ```
   *
   * @param query Параметры запроса
   */
  export function buildQuery(query: Query): string

  /**
   * Вспомогательная функция, которую можно использовать в реализации логики
   * повторения запросов при возникновении ошибки.
   *
   * Возвращает:
   *
   * - `true` - причина ошибка, скорее всего, вызвана временными неполадками,
   * поэтому запрос можно повторить.
   *
   * - `false` - запрос содержит ошибку, повторять запрос нецелесообразно.
   *
   * @param {Error} error Объект ошибки
   * @returns {boolean} `true` - если следует сделать повторную попытку, иначе `false`
   */
  export function shouldRetryError(error: Error): boolean

  /**
   * Метод используется для расширения библиотеки внешними модулями
   * @param extension Модуль расширения
   */
  export function compose(extension: Function): typeof Moysklad

  /** Описание конкретной ошибки в API МойСклад */
  export interface ApiErrorInfo {
    error: string
    code: number
    moreInfo: string
    column?: number
    line?: number
    error_message?: string
    dependencies?: {
      href: string
      type: string
      mediaType: string
      metadataHref?: string
      uuidHref?: string
    }[]
  }

  /**
   * Объект с полем `errors` в котором перечислены все ошибки.
   *
   * Используется для сообщения об ошибках в API МойСклад.
   */
  export interface ApiError {
    errors: ApiErrorInfo[]
  }

  /**
   * Внутренняя ошибка библиотеки не связанная с выполнением запроса к API
   */
  export class MoyskladError extends Error {}

  /**
   * Ошибка при выполнении запроса
   */
  export class MoyskladRequestError extends MoyskladError {
    /** url http запроса */
    url?: string

    /** Код статуса http запроса */
    status?: number

    /** Текст статуса http запроса */
    statusText?: string
  }

  /**
   * Ошибка если запрос вернул перенаправление (код `3xx`), когда явно не
   * указана опция запроса `rawRedirect` и опция `redirect` не равна `follow`
   */
  export class MoyskladUnexpectedRedirectError extends MoyskladRequestError {
    /** Location заголовок редиректа */
    location?: string
  }

  /**
   * Ошибка API МойСклад
   */
  export class MoyskladApiError extends MoyskladRequestError {
    /** Код первой ошибки */
    code: number

    /** Подробное описание из первой ошибки */
    moreInfo: string

    /** Список ошибок запроса */
    errors: ApiErrorInfo[]
  }

  /**
   * Ошибка в коллекции при массовом создании/изменении сущностей
   */
  export class MoyskladCollectionError extends MoyskladApiError {
    /**
     * Ошибки в соответствии с индексами переданных сущностей в исходной коллекции.
     *
     * Позволяет точно сопоставить ошибки с конкретной сущностью из коллекции.
     */
    errorsIndexes: Array<[number, ApiErrorInfo[]]>
  }

  /** Событие `request` отправки запроса */
  export interface RequestEvent {
    /** Уникальный номер запроса в рамках модуля библиотеки */
    requestId: number

    /** URL запроса */
    url: string

    /** Параметры запроса */
    options: any
  }

  /** Событие `response` получения ответа на запрос */
  export interface ResponseEvent extends RequestEvent {
    /** Ответ на запрос */
    response: Response
  }

  /** Событие `response:body` получения ответа на запрос */
  export interface ResponseBodyEvent extends ResponseEvent {
    body: any
  }

  export interface MoyskladEmitter {
    on(name: 'request', handler: (ev: RequestEvent) => void): this
    on(name: 'response', handler: (ev: ResponseEvent) => void): this
    on(name: 'response:body', handler: (ev: ResponseBodyEvent) => void): this
    on(
      name: 'error',
      handler: (error: Error, options: { requestId: number }) => void
    ): this
    on(name: string, handler: (...args: any[]) => void): this
  }
}
