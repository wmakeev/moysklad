const { cleanEnv, str } = require('envalid')

module.exports = cleanEnv(process.env, {
  TEST_ORGANIZATION_ID: str(),
  TEST_PRODUCT_01_ID: str(),
  TEST_PRODUCT_01_APP_ID: str(),
  TEST_PRODUCT_02_ID: str()
})
