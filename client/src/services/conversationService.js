import api from "./api";

export const getMyConversations = async () => {
    const response = await api.get("/conversations");
    console.log(response.data.conversations)
    return response.data.conversations;
};
export const createConversation = async (userId) => {
  const response = await api.post(
    "/conversations/createConversation",
    {
      userId,
    }
  );
  console.log(response.data.conversation)
  return response.data.conversation;
};