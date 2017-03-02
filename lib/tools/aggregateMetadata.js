'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var have = require('../have');
var getPropertyInfo = require('./getPropertyInfo');
var loadRows = require('./loadRows');

var CUSTOM_ENT_ID_REGEX = /\/([^/]+)\/([^/?]+)(?:\?.+)?$/;

var getFieldName = function getFieldName(fieldName) {
  return fieldName.toUpperCase().replace(/[^0-9a-zA-Zа-яА-Я_$]/g, '_').replace(/_{2,}/g, '_').replace(/_{1,}$/, '') // TODO Объединить последние два replace
  .replace(/^_{1,}/, '');
};

module.exports = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var _this = this;

    var _have,
        client,
        model,
        _have$options,
        options,
        _options$customEntity,
        customEntityFilter,
        Metadata,
        typeMetadataPromises,
        thread1,
        _args2 = arguments;

    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _have = have(_args2, {
              client: 'Obj', model: 'model', options: 'opt Obj'
            }), client = _have.client, model = _have.model, _have$options = _have.options, options = _have$options === undefined ? {} : _have$options;
            _options$customEntity = options.customEntityFilter, customEntityFilter = _options$customEntity === undefined ? function () {
              return true;
            } : _options$customEntity;
            Metadata = {
              updated: new Date(),
              formatVersion: '3.0.0'
            };

            // асинхронная загрузка метаданных внешних (доступных из API) сущностей

            typeMetadataPromises = Object.keys(model.types).filter(function (typeName) {
              var type = model.types[typeName];
              return type && type.external && getPropertyInfo(model, typeName, 'attributes');
            }).map(function (typeName) {
              Metadata[typeName] = {};
              return typeName;
            }).map(function (typeName) {
              return client.GET(['entity', typeName, 'metadata']).then(function (metadata) {
                return {
                  typeName: typeName, metadata: metadata
                };
              });
            });

            // асинхронная загрузка пользовательских атрибутов и справочников

            thread1 = typeMetadataPromises.map(function (p) {
              return p.then(function () {
                var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(typeMetadata) {
                  var typeName, metadata, type, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, attrState, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, attrMeta, customEntities, entName, collection, rows;

                  return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          typeName = typeMetadata.typeName, metadata = typeMetadata.metadata;
                          // type = Metadata.CustomerOrder

                          type = Metadata[typeName];

                          if (!metadata.states) {
                            _context.next = 23;
                            break;
                          }

                          // Metadata.CustomerOrder.States = {}
                          type.States = {};
                          // обработка метаданных сущности
                          _iteratorNormalCompletion = true;
                          _didIteratorError = false;
                          _iteratorError = undefined;
                          _context.prev = 7;
                          for (_iterator = metadata.states[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            attrState = _step.value;

                            // Metadata.CustomerOrder.States.ОФОРМЛЕН = state.id
                            type.States[getFieldName(attrState.name)] = attrState.id;
                          }
                          _context.next = 15;
                          break;

                        case 11:
                          _context.prev = 11;
                          _context.t0 = _context['catch'](7);
                          _didIteratorError = true;
                          _iteratorError = _context.t0;

                        case 15:
                          _context.prev = 15;
                          _context.prev = 16;

                          if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                          }

                        case 18:
                          _context.prev = 18;

                          if (!_didIteratorError) {
                            _context.next = 21;
                            break;
                          }

                          throw _iteratorError;

                        case 21:
                          return _context.finish(18);

                        case 22:
                          return _context.finish(15);

                        case 23:
                          if (!metadata.attributes) {
                            _context.next = 64;
                            break;
                          }

                          // Metadata.CustomerOrder.Attributes = {}
                          type.Attributes = {};
                          // обработка метаданных сущности
                          _iteratorNormalCompletion2 = true;
                          _didIteratorError2 = false;
                          _iteratorError2 = undefined;
                          _context.prev = 28;
                          _iterator2 = metadata.attributes[Symbol.iterator]();

                        case 30:
                          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                            _context.next = 50;
                            break;
                          }

                          attrMeta = _step2.value;

                          // Metadata.CustomerOrder.Attributes.ИСТОЧНИК_ЗАКАЗА = attribute.id
                          type.Attributes[getFieldName(attrMeta.name)] = attrMeta.id;

                          if (!attrMeta.customEntityMeta) {
                            _context.next = 47;
                            break;
                          }

                          _context.next = 36;
                          return client.fetchUri(attrMeta.customEntityMeta.href);

                        case 36:
                          customEntities = _context.sent;
                          entName = getFieldName(customEntities.name);
                          // заполнение пользовательского справочника (если не заполнен) и если не пропущен явно

                          if (!(!Metadata.CustomEntity[entName] && customEntityFilter(customEntities.name))) {
                            _context.next = 47;
                            break;
                          }

                          // Metadata.CustomEntity.ИСТОЧНИКИ_ЗАКАЗА = {}
                          Metadata.CustomEntity[entName] = {};
                          _context.next = 42;
                          return client.fetchUri(customEntities.entityMeta.href);

                        case 42:
                          collection = _context.sent;
                          _context.next = 45;
                          return loadRows(client, collection, { limit: 100 });

                        case 45:
                          rows = _context.sent;

                          rows.reduce(function (res, row) {
                            var match = CUSTOM_ENT_ID_REGEX.exec(row.meta.href);
                            // Metadata.CustomEntity.ИСТОЧНИКИ_ЗАКАЗА.САЙТ = '{id}/{id}'
                            res[getFieldName(row.name)] = match[1] + '/' + match[2];
                            return res;
                          }, Metadata.CustomEntity[entName]);

                        case 47:
                          _iteratorNormalCompletion2 = true;
                          _context.next = 30;
                          break;

                        case 50:
                          _context.next = 56;
                          break;

                        case 52:
                          _context.prev = 52;
                          _context.t1 = _context['catch'](28);
                          _didIteratorError2 = true;
                          _iteratorError2 = _context.t1;

                        case 56:
                          _context.prev = 56;
                          _context.prev = 57;

                          if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                          }

                        case 59:
                          _context.prev = 59;

                          if (!_didIteratorError2) {
                            _context.next = 62;
                            break;
                          }

                          throw _iteratorError2;

                        case 62:
                          return _context.finish(59);

                        case 63:
                          return _context.finish(56);

                        case 64:
                        case 'end':
                          return _context.stop();
                      }
                    }
                  }, _callee, _this, [[7, 11, 15, 23], [16,, 18, 22], [28, 52, 56, 64], [57,, 59, 63]]);
                }));

                return function (_x) {
                  return _ref2.apply(this, arguments);
                };
              }());
            });
            _context2.next = 7;
            return Promise.all(thread1);

          case 7:
            return _context2.abrupt('return', Metadata);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  function aggregateMetadata() {
    return _ref.apply(this, arguments);
  }

  return aggregateMetadata;
}();
//# sourceMappingURL=aggregateMetadata.js.map