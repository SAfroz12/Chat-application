import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import conversationReducer from "./conversationSlice";
import messageReducer from "./messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation:conversationReducer,
      message: messageReducer,
  },
});