import {createSlice,createAsyncThunk,} from "@reduxjs/toolkit";

import { getMessages } from "../services/messageService";
export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async (conversationId, { rejectWithValue }) => {
    try {
      const messages =
        await getMessages(conversationId);
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

export const { clearMessages } =
  messageSlice.actions;

export default messageSlice.reducer;