import { createSlice, createAsyncThunk, } from "@reduxjs/toolkit";

import { getMessages } from "../services/messageService";
export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const messages = await getMessages(conversationId);
      return messages;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch messages"
      );
    }
  }
);

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(
        (message) => message._id !== action.payload
      );
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;

      const message = state.messages.find(
        (message) => message._id === messageId
      );

      if (message) {
        message.status = status;
      }
    },
    updateMessagesStatus: (state, action) => {
      const { messageIds, status } = action.payload;

      state.messages.forEach((message) => {
        if (messageIds.includes(message._id)) {
          message.status = status;
        }
      });
    },
    editMessage: (state, action) => {
      const { messageId, text, edited } = action.payload;

      const message = state.messages.find(
        (message) => message._id === messageId
      );

      if (message) {
        message.text = text;
        message.edited = edited;
      }
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(
        fetchMessages.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      .addCase(
        fetchMessages.fulfilled,
        (state, action) => {
          state.loading = false;
          state.messages = action.payload;
        }
      )

      .addCase(
        fetchMessages.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearMessages, addMessage, updateMessageStatus,
   updateMessagesStatus, 
  deleteMessage,editMessage } =messageSlice.actions;
export default messageSlice.reducer;