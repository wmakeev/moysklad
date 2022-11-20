const { fetch } = require('undici')
const MoyskladCore = require('moysklad')

const ms = MoyskladCore({
  fetch,
  login: 'login',
  password: 'password'
})

let { rows: products } = await ms.GET('entity/products', { limit: 10 })

console.log(products.map(p => p.name))
