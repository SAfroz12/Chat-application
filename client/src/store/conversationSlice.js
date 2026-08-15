import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import { getMyConversations, createConversation, getConversation }
    from "../services/conversationService";
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
//get single conversation
export const fetchConversation =
    createAsyncThunk("conversation/fetchConversation",
        async (conversationId, { rejectWithValue }) => {
            try {
                const conversation =
                    await getConversation(conversationId);

                return conversation;
            } catch (error) {
                return rejectWithValue(
                    error.response?.data?.message ||
                    "Failed to fetch conversation"
                );
            }
        }
    );

const conversationSlice = createSlice({
    name: "conversation",

    initialState: {
        conversations: [],
        loading: false,
        selectedConversation: null,
        error: null,
        creating: false,
        createError: null,
        conversationLoading: false,
        conversationError: null,
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
            //single conversation
            .addCase(
                createNewConversation.rejected,
                (state, action) => {
                    state.creating = false;
                    state.createError =
                        action.payload;
                }
            ).addCase(
                fetchConversation.pending,
                (state) => {
                    state.conversationLoading = true;
                    state.conversationError = null;
                }
            )

            .addCase(
                fetchConversation.fulfilled,
                (state, action) => {
                    state.conversationLoading = false;
                    state.selectedConversation =
                        action.payload;
                }
            )

            .addCase(
                fetchConversation.rejected,
                (state, action) => {
                    state.conversationLoading = false;
                    state.conversationError =
                        action.payload;
                }
            )
    },
});

export default conversationSlice.reducer;