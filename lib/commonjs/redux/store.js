"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscription = exports.store = exports.StorePersist = void 0;
var _toolkit = require("@reduxjs/toolkit");
var _reduxPersist = require("redux-persist");
var _index = _interopRequireDefault(require("./index.reducer"));
var _Subscription = require("react-redux/es/utils/Subscription");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const store = (0, _toolkit.configureStore)({
  reducer: _index.default,
  middleware: getDefaultMiddleware => getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [_reduxPersist.FLUSH, _reduxPersist.REHYDRATE, _reduxPersist.PAUSE, _reduxPersist.PERSIST, _reduxPersist.PURGE, _reduxPersist.REGISTER]
    }
  })
});
exports.store = store;
const subscription = (0, _Subscription.createSubscription)(store);
exports.subscription = subscription;
const StorePersist = (0, _reduxPersist.persistStore)(store);

// Infer the `RootState` and `AppDispatch` types from the store itself

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
exports.StorePersist = StorePersist;
//# sourceMappingURL=store.js.map