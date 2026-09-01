import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversations, updateLastMessage } from "../store/conversationSlice";
import {
  fetchMessages, addMessage, updateMessageStatus, updateMessagesStatus, deleteMessage,
  editMessage
} from "../store/messageSlice";
import socket from "../socket/socket";
import { fetchUsers, clearUsers } from "../store/userSlice";
import { createConversation } from "../services/conversationService";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { uploadImage } from "../services/uploadService";
function Chat() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [text, setText] = useState("");
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [smartReplies, setSmartReplies] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state) => state.user);

  const {
    conversations,
    loading,
    error,
  } = useSelector((state) => state.conversation);

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
  } = useSelector((state) => state.message);

  // conversation click

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);

    dispatch(fetchMessages(conversation._id));

    socket.emit("joinConversation", conversation._id);

    socket.emit("messageRead", {
      conversationId: conversation._id,
    });

    setSmartReplies([]);
  };

  //messsage recieve
  const handleEditMessage = (message) => {
    setEditingMessageId(message._id);
    setText(message.text);
  };
  // send message

  const handleSendMessage = () => {
    if (!text.trim()) return;
    if (!selectedConversation) return;

    if (editingMessageId) {
      socket.emit("editMessage", {
        messageId: editingMessageId,
        conversationId: selectedConversation._id,
        text: text.trim(),
      });

      setEditingMessageId(null);
      setText("");
      return;
    }

    socket.emit("sendMessage", {
      conversationId: selectedConversation._id,
      text: text.trim(),
    });

    setText("");
    setSmartReplies([]);
  };



  // user click

  const handleUserClick = async (selectedUser) => {
    try {
      const conversation = await createConversation(selectedUser._id);

      dispatch(fetchConversations());

      setSelectedConversation(conversation);

      socket.emit("joinConversation", conversation._id);

      dispatch(fetchMessages(conversation._id));

      setShowNewChat(false);
      setSearch("");

      dispatch(clearUsers());
    } catch (error) {
      console.error(
        "Failed to create conversation:",
        error.response?.data || error
      );
    }
  };

  // search users

  const handleSearchUsers = (e) => {
    const value = e.target.value;

    setSearch(value);

    if (!value.trim()) {
      dispatch(clearUsers());
      return;
    }

    dispatch(fetchUsers(value));
  };

  // fetch conversations

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // typing

  useEffect(() => {
    const handleUserTyping = ({ userId }) => {
      if (userId !== user?._id) {
        setIsOtherTyping(true);
      }
    };

    const handleUserStoppedTyping = ({ userId }) => {
      if (userId !== user?._id) {
        setIsOtherTyping(false);
      }
    };

    socket.on("userTyping", handleUserTyping);
    socket.on("userStoppedTyping", handleUserStoppedTyping);

    return () => {
      socket.off("userTyping", handleUserTyping);
      socket.off("userStoppedTyping", handleUserStoppedTyping);
    };
  }, [user?._id]);



  //image upload thing 
  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);

      console.log("Uploaded image:", imageUrl);
      console.log("EMITTING IMAGE MESSAGE");
      socket.emit("sendMessage", {
        conversationId: selectedConversation._id,
        text: "",
        image: imageUrl,
      });

    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };
  // new message

  useEffect(() => {
    const handleNewMessage = (message) => {
      console.log("NEW MESSAGE FROM SOCKET:", message);
      console.log("IMAGE URL:", message.image);
      dispatch(addMessage(message));

      dispatch(updateLastMessage(message));

      if (message.sender._id !== user?._id) {
        socket.emit("messageDelivered", {
          messageId: message._id,
          conversationId: message.conversation,
        });
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [dispatch, user?._id]);

  // message delivered

  useEffect(() => {
    const handleMessageDelivered = ({ messageId }) => {
      dispatch(
        updateMessageStatus({
          messageId,
          status: "delivered",
        })
      );
    };

    socket.on("messageDelivered", handleMessageDelivered);

    return () => {
      socket.off("messageDelivered", handleMessageDelivered);
    };
  }, [dispatch]);

  // message read

  useEffect(() => {
    const handleMessageRead = ({ messageIds }) => {
      dispatch(
        updateMessagesStatus({
          messageIds,
          status: "read",
        })
      );
    };

    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("messageRead", handleMessageRead);
    };
  }, [dispatch]);

  // auto scroll

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // smart replies

  useEffect(() => {
    const handleSmartReplySuggestions = ({ suggestions }) => {
      setSmartReplies(suggestions);
    };

    socket.on(
      "smartReplySuggestions",
      handleSmartReplySuggestions
    );

    return () => {
      socket.off(
        "smartReplySuggestions",
        handleSmartReplySuggestions
      );
    };
  }, []);

  // delete message

  useEffect(() => {
    const handleMessageDeleted = ({ messageId }) => {
      dispatch(deleteMessage(messageId));
    };

    socket.on("messageDeleted", handleMessageDeleted);

    return () => {
      socket.off("messageDeleted", handleMessageDeleted);
    };
  }, [dispatch]);


  ///edit message
  useEffect(() => {
    const handleMessageEdited = ({
      messageId,
      text,
      edited,
    }) => {
      dispatch(editMessage({ messageId, text, edited, }));
    };

    socket.on("messageEdited", handleMessageEdited);

    return () => {
      socket.off("messageEdited", handleMessageEdited);
    };
  }, [dispatch]);

  // online / offline

  useEffect(() => {
    const handleOnlineUsers = ({ userIds }) => {
      setOnlineUsers(userIds);
    };

    const handleUserOnline = ({ userId }) => {
      setOnlineUsers((prev) => {
        if (prev.includes(userId)) {
          return prev;
        }

        return [...prev, userId];
      });
    };

    const handleUserOffline = ({ userId }) => {
      setOnlineUsers((prev) =>
        prev.filter((id) => id !== userId)
      );
    };

    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userOnline", handleUserOnline);
    socket.on("userOffline", handleUserOffline);

    socket.connect();

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userOnline", handleUserOnline);
      socket.off("userOffline", handleUserOffline);

      socket.disconnect();
    };
  }, []);

  // other participant

  const otherParticipant =
    selectedConversation?.participants?.find(
      (participant) => participant._id !== user?._id
    );

  const isOtherOnline =
    otherParticipant?._id &&
    onlineUsers.includes(otherParticipant._id.toString());

  // format time

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // avatar component

  const Avatar = ({ person, size = "h-10 w-10" }) => {
    return person?.avatar ? (
      <img
        src={person.avatar}
        alt={person.name}
        referrerPolicy="no-referrer"
        className={`${size} rounded-full object-cover`}
      />
    ) : (
      <div
        className={`${size} flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-semibold`}
      >
        {person?.name?.charAt(0).toUpperCase() || "U"}
      </div>
    );
  };

  // logout

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");

      socket.disconnect();

      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };



  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#0f2a4a_0%,#050912_35%,#02040a_75%,#010205_100%)] px-3 py-3 md:px-5 md:py-5">

      <div className="mx-auto flex h-[92vh] w-[92vw] max-w-[1700px] overflow-hidden rounded-3xl border border-[#1e3a5f] bg-[#0b1220] shadow-2xl shadow-black/60">
        {/* left sidebar */}

        <aside className="flex w-full max-w-[330px] flex-col border-r border-[#1e3a5f] bg-[#09111f]">
          {/* brand */}

          <div className="border-b border-[#1e2f4a] px-5 py-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
                  N
                </div>

                <div>
                  <h1 className="text-lg font-bold text-white">
                    Nexora
                  </h1>

                  <p className="text-xs text-slate-400">
                    Your conversations
                  </p>
                </div>

              </div>

              <button
                onClick={() => setShowNewChat(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-600/15 text-lg font-medium text-blue-400 transition hover:bg-blue-600/25"
                title="New conversation"
              >
                🔍
              </button>

            </div>

          </div>

          {/* current user */}

          <div className="border-b border-[#1e2f4a] px-5 py-4 bg-[#0a1424]">

            <div className="flex items-center gap-3">

              <div className="relative">

                <Avatar person={user} />

                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />

              </div>

              <div className="min-w-0">

                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "User"}
                </p>

                <p className="text-xs text-green-500">
                  Online
                </p>

              </div>

            </div>

          </div>

          {/* new chat */}

          {showNewChat && (
         <div className="border-b border-[#1e2f4a] bg-[#0d1828] p-4">

              <div className="mb-3 flex items-center justify-between">

                <h3 className="text-sm font-semibold text-white">
                  New Conversation
                </h3>

                <button
                  onClick={() => {
                    setShowNewChat(false);
                    setSearch("");
                    dispatch(clearUsers());
                  }}
               className="text-xs font-medium text-slate-400 hover:text-white"
                >
                  Close
                </button>

              </div>

              <input
                type="text"
                value={search}
                onChange={handleSearchUsers}
                placeholder="Search people..."
                className="w-full rounded-xl border border-[#263449] bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />

              <div className="mt-3 max-h-52 overflow-y-auto">

                {usersLoading && (
                  <p className="py-2 text-xs text-slate-400">
                    Searching...
                  </p>
                )}

                {usersError && (
                  <p className="py-2 text-xs text-red-500">
                    {usersError}
                  </p>
                )}

                {users.map((person) => (
                  <div
                    key={person._id}
                    onClick={() => handleUserClick(person)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-white"
                  >

                    <Avatar
                      person={person}
                      size="h-9 w-9"
                    />

                    <div className="min-w-0">

                      <p className="truncate text-sm font-medium text-slate-800">
                        {person.name}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {person.email}
                      </p>

                    </div>

                  </div>
                ))}

              </div>

            </div>
          )}

          {/* conversation title */}

          <div className="px-5 py-4">

            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Conversations
            </h2>

          </div>

          {/* conversations */}

          <div className="flex-1 overflow-y-auto">

            {loading && (
              <p className="px-5 py-4 text-sm text-slate-400">
                Loading conversations...
              </p>
            )}

            {error && (
              <p className="px-5 py-4 text-sm text-red-500">
                {error}
              </p>
            )}

            {!loading && conversations.length === 0 && (
              <div className="px-5 py-10 text-center">

                <p className="text-sm font-medium text-slate-500">
                  No conversations yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Start a new conversation
                </p>

              </div>
            )}

            {conversations.map((conversation) => {

              const participant =
                conversation.participants?.find(
                  (person) => person._id !== user?._id
                );

              const isSelected =
                selectedConversation?._id === conversation._id;

              const participantOnline =
                participant?._id &&
                onlineUsers.includes(
                  participant._id.toString()
                );

              return (
                <div
                  key={conversation._id}
                  onClick={() =>
                    handleConversationClick(conversation)
                  }
                  className={`flex cursor-pointer items-center gap-3 border-b border-[#16263b] px-5 py-4 transition ${isSelected
                    ? "bg-blue-600/15 border-l-2 border-blue-500 shadow-inner shadow-blue-500/5"
                    : "hover:bg-white/[0.03]"
                    }`}
                >

                  <div className="relative">

                    <Avatar
                      person={participant}
                      size="h-11 w-11"
                    />

                    {participantOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex items-center justify-between">

                      <p
                        className={`truncate text-sm font-semibold ${isSelected
                          ? "text-blue-400"
                          : "text-slate-200"
                          }`}
                      >
                        {participant?.name || "Conversation"}
                      </p>

                    </div>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {conversation.lastMessage?.text ||
                        "Start chatting..."}
                    </p>

                  </div>

                </div>
              );
            })}

          </div>

          {/* logout */}

          <div className="border-t border-[#1E293B] p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"          >
              <span className="text-base">↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* chat area */}

        <main className="hidden flex-1 flex-col md:flex">

          {!selectedConversation ? (

            /* empty state */

            <div className="flex flex-1 items-center justify-center bg-[#0a1424]">

              <div className="text-center">

                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-3xl font-bold text-blue-400 shadow-lg shadow-blue-900/20">
                  N
                </div>

                <h2 className="text-xl font-semibold text-white">
                  Welcome to Nexora
                </h2>
                <p className="mt-2 text-sm text-slate-400">
                  Select a conversation to start chatting
                </p>

              </div>

            </div>

          ) : (

            <>

              {/* chat header */}

              <div className="flex items-center justify-between border-b border-[#1e2f4a] bg-[#0c1626] px-6 py-5">
                <div className="flex items-center gap-3">

                  <div className="relative">

                    <Avatar
                      person={otherParticipant}
                      size="h-11 w-11"
                    />

                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0B1220] ${isOtherOnline
                        ? "bg-green-500"
                        : "bg-slate-300"
                        }`}
                    />

                  </div>

                  <div>

                    <h2 className="text-base font-semibold text-white">
                      {otherParticipant?.name || "User"}
                    </h2>

                    <p
                      className={`mt-0.5 text-xs ${isOtherOnline
                        ? "text-green-500"
                        : "text-slate-400"
                        }`}
                    >
                      {isOtherOnline
                        ? "Online"
                        : "Offline"}
                    </p>

                  </div>

                </div>

              </div>

              {/* messages */}

              <div className="flex-1 overflow-y-auto bg-[#07101c] px-6 py-6">

                {messagesLoading && (
                  <p className="text-center text-sm text-slate-400">
                    Loading messages...
                  </p>
                )}

                {messagesError && (
                  <p className="text-center text-sm text-red-500">
                    {messagesError}
                  </p>
                )}

                {!messagesLoading &&
                  messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">

                      <div className="text-center">

                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                          💬
                        </div>

                        <p className="text-sm font-medium text-slate-600">
                          No messages yet
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Send a message to start the conversation
                        </p>

                      </div>

                    </div>
                  )}

                {messages.map((message) => {

                  const senderId =
                    typeof message.sender === "object"
                      ? message.sender._id
                      : message.sender;

                  const isMyMessage =
                    senderId === user?._id;

                  return (
                    <div
                      key={message._id}
                      className={`mb-4 flex ${isMyMessage
                        ? "justify-end"
                        : "justify-start"
                        }`}
                    >

                      <div
                        className={`max-w-[70%] ${isMyMessage
                          ? "items-end"
                          : "items-start"
                          }`}
                      >

                        <div
                          className={`rounded-2xl px-4 py-3 shadow-lg ${isMyMessage
                            ? "rounded-br-md bg-[#2563eb] text-white shadow-lg shadow-blue-900/30"
                            : "rounded-bl-md border border-[#263a55] bg-[#101b2b] text-slate-100"
                            }`}
                        >
                          <div>
                            {message.image && (
                              <img
                                src={message.image}
                                alt="Shared image"
                                className="mb-2 max-w-sm rounded-xl border border-white/10 object-cover shadow-md"
                              />
                            )}
                            {message.text && (
                              <p className="text-sm leading-6 text-inherit">
                                {message.text}
                              </p>
                            )}

                            {message.edited && (
                              <span className="text-[10px] opacity-60">
                                edited
                              </span>
                            )}

                          </div>
                        </div>

                        <div
                          className={`mt-1.5 flex items-center gap-2 text-[11px] ${isMyMessage
                            ? "justify-end text-blue-400"
                            : "text-blue-400"
                            }`}
                        >

                          <span>
                            {formatMessageTime(
                              message.createdAt
                            )}
                          </span>

                          {isMyMessage && (
                            <>
                              <span
                                className={
                                  message.status === "read"
                                    ? "text-indigo-500"
                                    : ""
                                }
                              >
                                {message.status === "sent" &&
                                  "✓"}

                                {message.status ===
                                  "delivered" && "✓✓"}

                                {message.status === "read" &&
                                  "✓✓"}
                              </span>
                              <button
                                onClick={() => handleEditMessage(message)}
                                className="hover:text-indigo-500"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  socket.emit(
                                    "deleteMessage",
                                    {
                                      messageId:
                                        message._id,
                                      conversationId:
                                        selectedConversation._id,
                                    }
                                  );
                                }}
                                className="hover:text-red-500"
                              >
                                Delete
                              </button>
                            </>
                          )}

                        </div>

                      </div>

                    </div>
                  );
                })}

                <div ref={messagesEndRef} />

              </div>

              {/* typing */}

              {isOtherTyping && (
                <div className="bg-[#0B1220] px-6 pb-2">

                  <p className="text-xs text-slate-400">
                    {otherParticipant?.name} is typing...
                  </p>

                </div>
              )}

              {/* smart replies */}

              {smartReplies.length > 0 && (
               <div className="border-t border-[#1e2f4a] bg-[#0a1424] px-5 py-3">

                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Smart replies
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {smartReplies.map((reply, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setText(reply);
                          setSmartReplies([]);
                        }}
                        className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20"
                      >
                        {reply}
                      </button>
                    ))}

                  </div>

                </div>
              )}

              {/* input */}

              <div className="border-t border-[#1e2f4a] bg-[#0a1424] p-4">

                <div className="flex items-center gap-3">

                  {/* Image upload */}
                  <input
                    type="file"
                    accept="image/*"
                    id="image-upload"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  <label
                    htmlFor="image-upload"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-[#29415f] bg-[#101b2b] text-lg text-blue-400 transition hover:border-blue-500/50 hover:bg-blue-500/10"
                    title="Send image"
                  >
                    +
                  </label>

                  {/*/message input */}
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => {

                      const value = e.target.value;

                      setText(value);

                      if (!selectedConversation) {
                        return;
                      }

                      socket.emit("typing", {
                        conversationId:
                          selectedConversation._id,
                      });

                      clearTimeout(
                        typingTimeoutRef.current
                      );

                      typingTimeoutRef.current =
                        setTimeout(() => {

                          socket.emit("stopTyping", {
                            conversationId:
                              selectedConversation._id,
                          });

                        }, 1000);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                    placeholder="Write a message..."
                    className="flex-1 rounded-full border border-[#29415f] bg-[#101b2b] px-5 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />

                  <button
                    onClick={handleSendMessage}
                    disabled={!text.trim()}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-[#16263b] disabled:text-slate-600"
                    title="Send message"
                  >
                    ➤
                  </button>

                </div>

                <p className="mt-2 text-[10px] text-slate-400">
                  Press Enter to send
                </p>

              </div>

            </>
          )}

        </main>

      </div>

    </div>
  );
}

export default Chat;