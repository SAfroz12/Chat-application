import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getMyConversations, createConversation } from "../services/conversationService";
//get conversation
export const fetchConversations = createAsyncThunk(
    "conversation/fetchConversations",

    async (_, { rejectWithValue }) => {
        try {
            const conversations =
                await getMyConversations();

            return conversations;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                "Failed to fetch conversations"
            );
        }
    }
);
//create new conversation;

export const createNewConversation =
    createAsyncThunk(
        "conversation/createNewConversation",

        async (userId, { rejectWithValue }) => {
            try {
                const conversation =
                    await createConversation(userId);

                return conversation;
            } catch (error) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to create conversation"
                );
            }
        }
    );

const conversationSlice = createSlice({
    name: "conversation",

    initialState: {
        conversations: [],
        loading: false,
        error: null,
        creating: false,
        createError: null,
    },

    reducers: {},

    extraReducers: (builder) => {
        builder
            .addCase(
                fetchConversations.pending,
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )

            .addCase(
                fetchConversations.fulfilled,
                (state, action) => {
                    state.loading = false;
                    state.conversations = action.payload;
                }
            )
            .addCase(
                fetchConversations.rejected,
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            )
            //create conversation
            .addCase(
                createNewConversation.pending,
                (state) => {
                    state.creating = true;
                    state.createError = null;
                }
            )

            .addCase(
                createNewConversation.fulfilled,
                (state, action) => {
                    state.creating = false;

                    state.conversations.unshift(
                        action.payload
                    );
                }
            )

            .addCase(
                createNewConversation.rejected,
                (state, action) => {
                    state.creating = false;
                    state.createError =
                        action.payload;
                }
            );
    },
});

export default conversationSlice.reducer;