import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatUiReducer from "./chatUiSlice";
import { actionLogMiddleware } from "./devLog";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chatUi: chatUiReducer,
  },
  // Works with the browser Redux DevTools extension too.
  devTools: true,
  middleware: (getDefault) =>
    import.meta.env.DEV ? getDefault().concat(actionLogMiddleware) : getDefault(),
});
