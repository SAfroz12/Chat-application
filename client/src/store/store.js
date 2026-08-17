import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import conversationReducer from "./conversationSlice";
import messageReducer from "./messageSlice";
import userReducer from "./userSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversation:conversationReducer,
      message: messageReducer,
      user: userReducer,
  },
});