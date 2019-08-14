import { Stamp } from 'stampit'

export = Moysklad

/**
 * Создает экземпляр клиента для рабты с API МойСклад
 * @param options Параметры инициализации экземпляра
 */
declare function Moysklad (options: Moysklad.Options): Moysklad.Instance

declare namespace Moysklad {
  export interface Instance {
    /**
     * Выполняет GET запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param query Строка запроса
     * @param options Опции запроса
     */
    GET<T> (path: string | string[], query?: Query, options?: RequestOptions): Promise<T>
    GET<T> (params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Строка запроса */
      query?: Query
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<T>

    /**
     * Выполняет POST запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    POST<T> (path: string | string[], payload: Object | Object[], query?: Query, options?: RequestOptions): Promise<T>
    POST<T> (params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: Object | Object[]
      /** Строка запроса */
      query?: Query
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<T>

    /**
     * Выполняет PUT запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param payload Тело запроса
     * @param query Строка запроса
     * @param options Опции запроса
     */
    PUT<T> (path: string | string[], payload: Object | Object[], query?: Query, options?: RequestOptions): Promise<T>
    PUT<T> (params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Тело запроса */
      payload: Object | Object[]
      /** Строка запроса */
      query?: Query
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<T>

    /**
     * Выполняет DELETE запрос по указанному ресурсу
     * @param path Путь к ресурсу
     * @param options Опции запроса
     */
    DELETE<T> (path: string | string[], options?: RequestOptions): Promise<any>
    DELETE<T> (params: {
      /** Путь к ресурсу */
      path: string | string[]
      /** Опции запроса */
      options?: RequestOptions
    }): Promise<T>

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
    getOptions (): Options

    /**
     * Возвращает полный url для указанных параметров
     * @param path Путь к ресурсу или href
     * @param query Параметры строки запроса
     *
     * Пример:
     * ```js
     * ms.buildUrl('entity/customerorder', { expand: 'agent' })
     * // https://online.moysklad.ru/api/remap/1.1/entity/customerorder?expand=agent
     *
     * ms.buildUrl(['entity/customerorder', 'foo-id'])
     * // https://online.moysklad.ru/api/remap/1.1/entity/customerorder/foo-id
     * ```
     */
    buildUrl (path: string | string[], query?: Query): string

    /**
     * Разбирает url ресурса API МойСклад на составные части
     * @param url url ресурса API МойСклад
     */
    parseUrl (url: string): {
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
     * const url = `https://online.moysklad.ru/api/remap/1.1/entity/customerorder/eb7bc422-ae8d-11e3-9e32-002590a28eca`
     *
     * const patch = { applicable: false }
     *
     * const updatedOrder = await ms.fetchUrl(url, {
     *  method: 'PUT',
     *  body: JSON.stringify(patch)
     * })
     * ```
     */
    fetchUrl<T> (url: string, options?: RequestOptions): Promise<T>
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
     * по умолчанию `1.1`
     */
    apiVersion?: string

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

    [option: string]: any
  }

  export type QueryValue = string | number | boolean | Date | null

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
     * Наличие значения (не null) `key!=`
     */
    $exists?: true

    /**
     * Пустое значение (null) `key=`
     */
    $exists?: false

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
    [key: string]: QueryValue | QueryValue[] | QueryObject
  }

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
    filter?: {
      [key: string]: QueryValue | QueryObject
    } | string

    /**
     * Используется для раскрытия ссылок на связанные объекты
     *
     * Пример: `agent,positions.assortment`
     */
    expand?: string,

    /** Задает ограничение на кол-во возвращаемых элементов в коллекции */
    limit?: number

    /** Задает смещение для первого элемента в коллекции */
    offset?: number

    /**
     * Сортировка выборки
     *
     * Примеры:
     * - `name`
     * - `code,desc`
     * - `name;code,desc`
     * - `name,desc;code,asc`
     */
    order?: string

    [key: string]: QueryValue | QueryValue[]
  }

  /**
   * Преобразует дату в строку в формате API МойСклад в часовом поясе Москвы
   * @param date дата
   * @param includeMs если `true`, то в результирующую дату будут включены миллисекунды
   */
  export function getTimeString (date: Date, includeMs?: boolean): string

  /**
   * Преобразует строку с датой в формате API МойСклад в объект даты (с учетом часового пояса исходной даты)
   * @param date дата в формате МойСклад (напр. `2017-04-08 13:33:00.123`)
   */
  export function parseTimeString (date: string): Date

  /**
   * Метод используется для расширения библиотеки внешними модулями
   * @param stamp Модуль расширения
   */
  export function compose (extension: Stamp): typeof Moysklad
}
