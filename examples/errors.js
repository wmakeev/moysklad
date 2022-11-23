const { fetch, Response } = require('undici')

/** @type {import('..')} */
const Moysklad = require('moysklad')

const ms = Moysklad({ apiVersion: '1.2', fetch })

function logError(num, err) {
  const obj = Object.fromEntries([
    ['name', err.name.toString()],
    ['message', err.message.toString()],
    ...[...Object.entries(err)].slice(1)
  ])

  console.log(`(${num})`, JSON.stringify(obj, null, 2), '\n')
}

async function showErrors() {
  //#region (1) MoyskladError
  try {
    await ms.GET('entity/product', {
      filter: 123
    })
  } catch (err) {
    logError(1, err)
  }
  //#endregion

  //#region (2) MoyskladRequestError
  try {
    const ms2 = Moysklad({ fetch, api: 'foo', apiVersion: '0' })
    await ms2.GET('foo/bar')
  } catch (err) {
    logError(2, err)
  }
  //#endregion

  //#region (3) MoyskladApiError
  try {
    await ms.GET('entity/product2')
  } catch (err) {
    logError(3, err)
  }
  //#endregion

  //#region (4) MoyskladApiError (muteApiErrors)
  const rawError1 = await ms.GET('entity/product2', null, {
    muteApiErrors: true
  })
  console.log('(4)', rawError1.errors[0].error)
  //#endregion

  //#region (5) MoyskladUnexpectedRedirectError (error handle)
  /** id товара из приложения МойСклад */
  const uuidFromApp = 'cb277549-34f4-4029-b9de-7b37e8e25a54'

  /** id товара из API (отличается от id из приложения) */
  let uuidFromApi

  try {
    await ms.GET(`entity/product/${uuidFromApp}`)
  } catch (err) {
    logError(5, err)

    if (err instanceof Moysklad.MoyskladUnexpectedRedirectError) {
      uuidFromApi = ms.parseUrl(err.location).path.pop()
    } else {
      throw err
    }
  }
  //#endregion

  //#region (6) MoyskladUnexpectedRedirectError (rawRedirect)
  let product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    rawRedirect: true
  })

  if (product instanceof Response) {
    uuidFromApi = ms.parseUrl(product.headers.get('location')).path.pop()

    product = await ms.GET(`entity/product/${uuidFromApi}`)
  }

  console.log('(6)', product.id === uuidFromApp, '\n') // false
  //#endregion

  //#region (7) MoyskladUnexpectedRedirectError (follow)
  product = await ms.GET(`entity/product/${uuidFromApp}`, null, {
    redirect: 'follow'
  })

  console.log('(7)', product.id === uuidFromApp, '\n') // false
  //#endregion

  //#region (8) MoyskladCollectionError
  try {
    await ms.POST('entity/product', [
      { foo: 'bar' },
      {
        meta: {
          type: 'product',
          href: ms.buildUrl(`entity/product/${uuidFromApi}`)
        },
        weight: 42
      },
      { name: 123 }
    ])
  } catch (err) {
    logError(8, err)
  }
  //#endregion

  //#region (9) MoyskladCollectionError (muteCollectionErrors)
  const result2 = await ms.POST(
    'entity/product',
    [
      { foo: 'bar' },
      {
        meta: {
          type: 'product',
          href: ms.buildUrl(`entity/product/${uuidFromApi}`)
        },
        weight: 42
      },
      { name: 123 }
    ],
    null,
    {
      muteCollectionErrors: true
    }
  )

  const collItemError = result2.find(it => it.errors)

  if (collItemError) {
    console.log('(9)', collItemError.errors[0].error)
    // (7) Ошибка сохранения объекта: поле 'name' не может быть пустым или отсутствовать
  }
  //#endregion
}

showErrors()
