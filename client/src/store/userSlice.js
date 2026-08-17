import {createSlice,createAsyncThunk,} from "@reduxjs/toolkit";
import { searchUsers } from "../services/userService";
export const fetchUsers = createAsyncThunk(
  "user/searchUsers",
  async (search, { rejectWithValue }) => {
    try {
      const users = await searchUsers(search);

      return users;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to search users"
      );
    }
  }
);
const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUsers: (state) => {
      state.users = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUsers } = userSlice.actions;
export default userSlice.reducer;