const nodeFetch = require('node-fetch')
const MoyskladCore = require('moysklad')

const ms = MoyskladCore({
  fetch: nodeFetch,
  login: 'login',
  password: 'password'
})

let { rows: products } = await ms.GET('entity/products', { limit: 10 })

console.log(products.map(p => p.name))
