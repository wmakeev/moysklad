# TODO

> Некоторые вопросы и задачи которые возникают в процессе разработки

## Features

- [ ] `X-Lognex-Get-Content` (?)

  ```txt
  Чтобы получить в ответе непосредственно файл, нужно использовать специальный заголовок X-Lognex-Get-Content со значение true - увидел, что этой информации нет в документации, это будет исправлено.
  ```

  Откуда это? Не могу найти источника. Как работает этот заголовок?

- [ ] Дополнительный метод `Moysklad#request` как основа для запроса (?)

  ```js
  const ms = Moysklad()
  const response = await ms
    .request('entity/customerorder')
    .setHeader('FOO', 'bar') // можно установить заголовок
    .method('GET') // выбор метода
    .toPromise() // выполнение запроса и возвращение Promise'а
  ```

- [ ] Нужно ли вообще "давить" ошибки в `.GET/POST/...` запросах даже через опцию? Может полностью передать эту возможность `.request` подобному API в "ручное" управление.

## Enhancements

- [ ] (?) Подключить matchers отдельным модулем

- [ ] Загрузка параметров из переменных окружения (добавить описание в документацию)

- [ ] (?) Добавить в тайпинг вывод `Response | unknown` для опций при которых возвращается "сырой" ответ

- [ ] Дописать раздел с про тайпинги

  - `import('undici').Response` vs `Response`

- [ ] Требуется еще вычитать документацию, возможно поправить кое-где примеры и обновить описания.

- [ ] Сложно работать с документацией (синхронно обновлять доки в тайпингах и README)

- [ ] Надо подумать когда лучше запускать создание файла version.js в процессе публикации (он должен быть включен в бандл, а версия двигается через np)

- [ ] Перенести сборку на GitHub Actions

- [ ] Нужно ли добавить различные typeguard'ы? Вроде `isApiError` для проверки на интерфейс `{ errors }`? (можно перепутать с классом ошибки `MoyskladApiError`)

- [ ] Непонятная ошибка если делать пост с null `ms.POST('entity/...', [..., null, ...])`

- [ ] Изначально не продуман интерфейс для получения ответа в разных форматах (чистый Response, предварительно разобранный, с учетом ошибок и разные комбинации этих параметров)

- [ ] Переименовать `MoyskladRequestError` в `MoyskladFetchError`, т.к. это общая ошибка как на стадии request, так и response

- [ ] Всю логику работы с ошибками нужно перерабатывать. Есть нелогичные моменты. Важно рассмотреть каждую точку где может произойти ошибка в процессе запроса. `MoyskladRequestError` - слишком общая ошибка.
