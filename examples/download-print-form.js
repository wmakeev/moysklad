const path = require('node:path')
const { writeFile } = require('node:fs/promises')
const { fetch } = require('undici')

/** @type {import('..')} */
const Moysklad = require('moysklad')

const TEMPLATE_ID = '8a686b8a-9e4a-11e5-7a69-97110004af3e'
const DEMAND_ID = '13abf361-e9c6-45ea-a940-df70289a7f95'

async function downloadPrintForm() {
  const ms = Moysklad({ fetch })

  const body = {
    template: {
      meta: {
        href: ms.buildUrl(
          `entity/demand/metadata/customtemplate/${TEMPLATE_ID}`
        ),
        type: 'customtemplate',
        mediaType: 'application/json'
      }
    },
    extension: 'pdf'
  }

  /** @type {import('undici').Response} */
  const response = await ms.POST(
    `entity/demand/${DEMAND_ID}/export`,
    body,
    null,
    // вернуть результат запроса с редиректом без предварительного разбора
    { rawRedirect: true }
  )

  const location = response.headers.get('location')

  console.log(location)
  // 'https://print-prod.moysklad.ru/temp/.../00123.pdf'

  const formResponse = await fetch(location)

  // TODO undici возвращает веб-стримы (апгрейдится до 18-й ноды пока рановато)

  const blob = await formResponse.blob()

  const buffer = Buffer.from(await blob.arrayBuffer())

  await writeFile(path.join(process.cwd(), '__temp/form.pdf'), buffer)
}

downloadPrintForm()
