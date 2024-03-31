import { configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";

import globalReducer from "./reducer";

export type AppDispatch = typeof store.dispatch;

const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
  reducer: {
    global: globalReducer,
  },
});

export default store;
