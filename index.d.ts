export = Moysklad

/**
 * Создает экземпляр клиента для рабты с API МойСклад
 * @param options Параметры инициализации экземпляра
 */
declare function Moysklad (options?: Moysklad.Options): Moysklad.Instance

declare namespace Moysklad {
  export interface Instance {
    /**
     * Выполняет GET запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param query Строка запроса
     * @param options Опции запроса
     */
    GET(
      path: string | string[],
      query?: Query | null,
      options?: RequestOptions
    ): Promise<any>
    GET(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Строка запроса */
      query?: Query | null
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<any>

    /**
     * Выполняет POST запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    POST(
      path: string | string[],
      payload: any,
      query?: Query | null,
      options?: RequestOptions
    ): Promise<any>
    POST(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: any
      /** Строка запроса */
      query?: Query | null
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<any>

    /**
     * Выполняет PUT запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    PUT(
      path: string | string[],
      payload: any,
      query?: Query | null,
      options?: RequestOptions
    ): Promise<any>
    PUT(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: any
      /** Строка запроса */
      query?: Query | null
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<any>

    /**
     * Выполняет DELETE запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param options Опции запроса
     */
    DELETE(path: string | string[], options?: RequestOptions): Promise<any>
    DELETE(params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Опции запроса */
      options?: RequestOptions
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
     * // {endpoint: "https://online.moysklad.ru/api", api: "remap", apiVersion: "1.2", fetch: }
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
     * @param path Путь к ресурсу или href
     * @param query Параметры строки запроса
     *
     * Пример:
     * ```js
     * ms.buildUrl('entity/customerorder', { expand: 'agent' })
     * // https://online.moysklad.ru/api/remap/1.2/entity/customerorder?expand=agent
     *
     * ms.buildUrl(['entity/customerorder', 'foo-id'])
     * // https://online.moysklad.ru/api/remap/1.2/entity/customerorder/foo-id
     * ```
     */
    buildUrl(path: string | string[], query?: Query): string

    /**
     * Разбирает url ресурса API МойСклад на составные части
     * @param url url, path или ref ресурса API МойСклад
     *
     * - url `https://...`
     * - path `["path", "to"]`
     * - ref `"path/to"`
     */
    parseUrl(
      url: string
    ): {
      /**
       * Точка досупа к API
       *
       * Пример: `https://online.moysklad.ru/api`
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
     * @param url url ресурса
     * @param options Параметры запроса
     *
     * Пример:
     * ```js
     * const url = `https://online.moysklad.ru/api/remap/1.2/entity/customerorder/eb7bc422-ae8d-11e3-9e32-002590a28eca`
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
     *
     * Если указан ло
     */
    getAuthHeader(): string
  }

  /**
   * Параметры инициализации экземпляра клиента
   */
  export interface Options {
    /**
     * Функция с интерфейсом [Fetch API](https://developer.mozilla.org/ru/docs/Web/API/Fetch_API)
     *
     * по умолчанию используется глобальный fetch (если глобальный fetch не найден, то будет выброшена ошибка)
     */
    fetch?: any

    /**
     * Точка досупа к API
     *
     * по умолчанию `https://online.moysklad.ru/api`
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
     * Экземляр [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) для получения событий
     *
     * Пример использования:
     *
     * ```js
     * const fetch = require('node-fetch')
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
     *   .on('request', ({ url, options }) => {
     *     console.log(`${options.method} ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('response', ({ url, options: { method }, response: { statusText, status } }) => {
     *     console.log(`${method} ${statusText} ${status} ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('response:body', ({ url, options: { method }, response, body }) => {
     *     console.log(`${method} BODY ${url} (+${Date.now() - startTime}ms)`)
     *   })
     *   .on('error', (...args) => {
     *     console.log(args)
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
     * GET https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+4ms)
     * GET OK 200 https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+575ms)
     * GET BODY https://online.moysklad.ru/api/remap/1.2/entity/customerorder?limit=1 (+580ms)
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
   * Все опции переданные в объекте `options` (за исключением вспомогательных) передаются напрямую в опции метода `fetch` ([Fetch API](http://github.github.io/fetch/)) при осуществлении запроса.
   */
  export interface RequestOptions {
    /**
     * Если `true`, то метод вернет результат в виде объекта [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)
     */
    rawResponse?: boolean

    /**
     * Если `true`, то все ошибки будут проигнорированы (метод не будет генерировать ошибку если код ответа сервера не в диапазоне 200-299 и/или тело ответа содержит описание ошибки МойСклад).
     * Ошибка вернется как результат ввиде объекта.
     *
     * Пример:
     * ```js
     * const result = await ms.GET('foo', null, { muteErrors: true })
     *
     * if (result.errors) {
     *  console.log(result.errors[0].error)
     * }
     * ```
     */
    muteErrors?: boolean

    /**
     * Если `true`, то в запрос будет включен заголовок `X-Lognex-Format-Millisecond` со значением `true` (все даты объекта будут возвращены с учетом миллисекунд).
     * @deprecated начиная с версии Remap API 1.2
     */
    millisecond?: boolean

    /**
     * Если `true`, то в запрос будет включен заголовок `X-Lognex-Precision` со значением `true` (отключение округления цен и себестоимости до копеек).
     */
    precision?: boolean

    /**
     * Если `true`, то в запрос будет включен заголовок `X-Lognex-WebHook-Disable` со значением `true` (отключить уведомления вебхуков в контексте данного запроса).
     */
    webHookDisable?: boolean

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
    $eq?: QueryValue

    /**
     * Не равно `key!=value`
     */
    $ne?: QueryValue

    /**
     * Больше `key>value`
     */
    $gt?: QueryValue

    /**
     * Больше или равно `key>=value`
     */
    $gte?: QueryValue

    /**
     * Меньше `key<value`
     */
    $lt?: QueryValue

    /**
     * Меньше или равно `key<=value`
     */
    $lte?: QueryValue

    /**
     * Начинается со строки `key~=value`
     */
    $st?: QueryValue

    /**
     * Заканчивается строкой `key=~value`
     */
    $et?: QueryValue

    /**
     * Содержит строку `key~value`
     */
    $contains?: QueryValue

    /**
     * Входит в `key=value1;key=value2;...`
     */
    $in?: QueryValue[]

    /**
     * Не входит `key!=value1;key!=value2;...`
     */
    $nin?: QueryValue[]

    /**
     * Наличие значения (не null)
     *
     * true - `key!=`
     * false - `key=`
     */
    $exists?: boolean

    /**
     * Объединение нескольких условий
     */
    $and?: QueryObject[]

    /**
     * Отрицание условия
     */
    $not?: QueryObject

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
     *    applicale: true,
     *    moment: {
     *      $gt: '2019-08-10 11:00'
     *    }
     * }
     * ```
     */
    filter?: QueryFilter | string

    /** TODO */
    search?: string

    /**
     * Используется для раскрытия ссылок на связанные объекты
     *
     * Пример: `agent,positions.assortment`
     *
     * Если указан `expand` и не указан `limit`, то `limit` будет автоматически установлен как `100`
     */
    expand?: string

    /**
     * Задает ограничение на кол-во возвращаемых элементов в коллекции
     *
     * Если указан `expand` и не указан `limit`, то `limit` будет автоматически установлен как `100`
     */
    limit?: number

    /** Задает смещение для первого элемента в коллекции */
    offset?: number

    /**
     * Сортировка выборки
     *
     * Примеры:
     * - `name` или `['name']`
     * - `code,desc` или `[['code','desc']]`
     * - `name;code,desc` или `['name', ['code','desc']]`
     * - `name,desc;code,asc` или `['name,desc', ['code','asc']]`
     */
    order?: QueryOrder | string

    [key: string]: any
  }

  /**
   * Преобразует дату в строку в формате API МойСклад в часовом поясе Москвы
   * @param date дата
   * @param includeMs если `true`, то в результирующую дату будут включены миллисекунды
   */
  export function getTimeString (date: Date | number, includeMs?: boolean): string

  /**
   * Преобразует строку с датой в формате API МойСклад в объект даты (с учетом часового пояса исходной даты)
   * @param date дата в формате МойСклад (напр. `2017-04-08 13:33:00.123`)
   */
  export function parseTimeString (date: string): Date

  /**
   * Метод используется для расширения библиотеки внешними модулями
   * @param extension Модуль расширения
   */
  export function compose (extension: Function): typeof Moysklad

  interface ApiErrorInfo {
    error: string
    code: number
    moreInfo: string
    column?: number
    line?: number
    error_message?: string
  }

  export class MoyskladError extends Error {}

  export class MoyskladRequestError extends MoyskladError {
    /** url http запроса */
    url?: string

    /** Код статуса http запроса */
    status?: number

    /** Текст статуса http запроса */
    statusText?: string
  }

  export class MoyskladApiError extends MoyskladRequestError {
    /** Код первой ошибки */
    code: number

    /** Подробное описание из первой ошибки */
    moreInfo: string

    /** Список ошибок запроса */
    errors: ApiErrorInfo[]
  }
}
