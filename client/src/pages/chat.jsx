import { useEffect,useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { fetchConversations } from "../store/conversationSlice";
import { fetchMessages, } from "../store/messageSlice";
function Chat() {
  const dispatch = useDispatch();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const { conversations, loading, error, } = useSelector(
    (state) => state.conversation
  );

  const { messages, loading: messagesLoading, error: messagesError, } =
    useSelector((state) => state.message);
  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);

    dispatch(fetchMessages(conversation._id));
  };
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-lg bg-white shadow">

        {/* Header */}
        <div className="border-b px-6 py-4">
          <h1 className="text-xl font-semibold">
            Chat Application
          </h1>
        </div>

        <div className="flex min-h-[600px]">

          {/* Sidebar */}
          <div className="w-80 border-r">

            <div className="border-b px-5 py-4">
              <h2 className="font-semibold">
                Conversations
              </h2>
            </div>

            {loading && (
              <p className="p-5 text-sm text-gray-500">
                Loading conversations...
              </p>
            )}

            {error && (
              <p className="p-5 text-sm text-red-500">
                {error}
              </p>
            )}

            {!loading &&
              conversations.length === 0 && (
                <p className="p-5 text-sm text-gray-500">
                  No conversations yet
                </p>
              )}

            <div>
              {conversations.map(
                (conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationClick(conversation)}
                    className="cursor-pointer border-b px-5 py-4 hover:bg-gray-50"
                  >
                    <p className="font-medium">
                      Conversation
                    </p>

                    {conversation.lastMessage && (
                      <p className="mt-1 truncate text-sm text-gray-500">
                        {conversation.lastMessage.text}
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col">

            {!selectedConversation ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-gray-500">
                  Select a conversation to start chatting
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="border-b px-6 py-4">
                  <h2 className="font-semibold">
                    Chat
                  </h2>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6">

                  {messagesLoading && (
                    <p className="text-sm text-gray-500">
                      Loading messages...
                    </p>
                  )}

                  {messagesError && (
                    <p className="text-sm text-red-500">
                      {messagesError}
                    </p>
                  )}

                  {!messagesLoading &&
                    messages.length === 0 && (
                      <p className="text-sm text-gray-500">
                        No messages yet.
                      </p>
                    )}

                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className="mb-3"
                    >
                      <div className="inline-block rounded-lg bg-gray-100 px-4 py-2">
                        {message.text}
                      </div>
                    </div>
                  ))}

                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;