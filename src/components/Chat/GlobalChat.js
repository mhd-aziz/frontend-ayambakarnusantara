import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Card,
  Spinner,
  ListGroup,
  Image,
  Form,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  ChatDots,
  XLg,
  SendFill,
  ArrowUpCircle,
  ArrowLeftShort,
} from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import * as ChatService from "../../services/ChatService";
import "../../css/GlobalChat.css";

function firestoreTimestampToDate(tsObject) {
  if (!tsObject || typeof tsObject._seconds !== "number") {
    return null;
  }
  return new Date(
    tsObject._seconds * 1000 + (tsObject._nanoseconds || 0) / 1000000
  );
}

const ConversationItem = ({
  conversation,
  onSelect,
  isActive,
  currentUserUID,
}) => {
  const otherParticipantUID = conversation.participantUIDs.find(
    (uid) => uid !== currentUserUID
  );
  const otherParticipantInfo =
    conversation.participantInfo &&
    conversation.participantInfo[otherParticipantUID];
  const displayName =
    otherParticipantInfo?.displayName || "Pengguna Tidak Dikenal";
  const photoURL = otherParticipantInfo?.photoURL;
  const lastMessageText = conversation.lastMessage?.text || "Belum ada pesan.";

  const lastMessageDateObject = conversation.lastMessage?.timestamp
    ? firestoreTimestampToDate(conversation.lastMessage.timestamp)
    : null;
  const lastMessageTimestamp = lastMessageDateObject
    ? lastMessageDateObject.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <ListGroup.Item
      action
      onClick={() => onSelect(conversation)}
      active={isActive}
      className="conversation-item"
    >
      <div className="d-flex align-items-center">
        <Image
          src={
            photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              displayName
            )}&background=C07722&color=fff&size=40`
          }
          roundedCircle
          width="40"
          height="40"
          className="me-3 conversation-avatar flex-shrink-0"
          alt={`Avatar ${displayName}`}
        />
        <div className="conversation-info flex-grow-1">
          <div className="d-flex justify-content-between align-items-start">
            <strong className="conversation-name text-truncate">
              {displayName}
            </strong>
            <small className="text-muted conversation-timestamp ms-2">
              {lastMessageTimestamp}
            </small>
          </div>
          <small className="text-muted conversation-last-message text-truncate d-block">
            {conversation.lastMessage?.senderUID === currentUserUID && "Anda: "}
            {lastMessageText}
          </small>
        </div>
      </div>
    </ListGroup.Item>
  );
};

const MessageBubble = ({ message, isSender }) => {
  const messageDateObject = message.timestamp
    ? new Date(message.timestamp)
    : null;
  const messageTimestampDisplay = messageDateObject
    ? messageDateObject.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className={`message-bubble-row ${isSender ? "sender" : "receiver"}`}>
      <div className={`message-bubble ${isSender ? "sender" : "receiver"}`}>
        <p className="message-text mb-1">{message.text}</p>
        <small className="message-timestamp">{messageTimestampDisplay}</small>
      </div>
    </div>
  );
};

function GlobalChat({
  recipientToInitiateChat,
  onChatInitiated,
  onRequestClose,
}) {
  const { user: currentUser, isLoggedIn } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isInitiatingChat, setIsInitiatingChat] = useState(false);
  const [errorConversations, setErrorConversations] = useState("");
  const [errorMessages, setErrorMessages] = useState("");
  const [errorSending, setErrorSending] = useState("");
  const [errorInitiating, setErrorInitiating] = useState("");
  const currentUserUID = currentUser?.uid;
  const messagesEndRef = useRef(null);
  const processedRecipientUIDRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  const sortConversations = (convos) => {
    return [...convos].sort((a, b) => {
      const dateA = a.updatedAt
        ? firestoreTimestampToDate(a.updatedAt)?.getTime() || 0
        : 0;
      const dateB = b.updatedAt
        ? firestoreTimestampToDate(b.updatedAt)?.getTime() || 0
        : 0;
      return dateB - dateA;
    });
  };

  const loadConversations = useCallback(async () => {
    if (!isLoggedIn || !currentUserUID) return;
    setIsLoadingConversations(true);
    setErrorConversations("");
    try {
      const response = await ChatService.getAllConversations();
      if (response && response.success === true) {
        setConversations(sortConversations(response.data || []));
      } else {
        setErrorConversations(response?.message || "Gagal memuat percakapan.");
        setConversations([]);
      }
    } catch (err) {
      setErrorConversations(
        err.message || "Terjadi kesalahan saat memuat percakapan."
      );
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [isLoggedIn, currentUserUID]);

  useEffect(() => {
    if (isLoggedIn) {
      loadConversations();
    } else {
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      setErrorConversations("");
      setErrorMessages("");
      setErrorSending("");
      setErrorInitiating("");
    }
  }, [isLoggedIn, loadConversations]);

  const loadMessages = useCallback(
    async (conversationId, loadMore = false, currentMessagesState = []) => {
      if (!conversationId) return;
      setIsLoadingMessages(true);
      setErrorMessages("");
      try {
        const params = { limit: 20 };
        if (loadMore && currentMessagesState.length > 0) {
          const oldestMessageTimestamp = currentMessagesState[0]?.timestamp;
          params.beforeTimestamp =
            typeof oldestMessageTimestamp === "string"
              ? oldestMessageTimestamp
              : firestoreTimestampToDate(oldestMessageTimestamp)?.toISOString();
        }
        const response = await ChatService.getMessages(conversationId, params);
        if (response && response.success === true && response.data) {
          setMessages((prevMessages) =>
            loadMore ? [...response.data, ...prevMessages] : response.data
          );
          if (!loadMore) {
            setTimeout(scrollToBottom, 0);
          }
        } else {
          setErrorMessages(response?.message || "Gagal memuat pesan.");
        }
      } catch (err) {
        setErrorMessages(err.message || "Terjadi kesalahan saat memuat pesan.");
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [scrollToBottom]
  );

  useEffect(() => {
    if (selectedConversation?._id) {
      setMessages([]);
      loadMessages(selectedConversation._id, false, []);
    } else {
      setMessages([]);
    }
  }, [selectedConversation?._id, loadMessages]);

  useEffect(() => {
    let isMounted = true;
    const handleInitiate = async (targetUID) => {
      if (!isLoggedIn || !currentUserUID || isInitiatingChat) return;
      if (
        targetUID === processedRecipientUIDRef.current &&
        selectedConversation?.participantUIDs.includes(targetUID)
      ) {
        if (onChatInitiated && !isInitiatingChat) {
          onChatInitiated(selectedConversation);
        }
        return;
      }
      setIsInitiatingChat(true);
      setErrorInitiating("");
      processedRecipientUIDRef.current = targetUID;
      try {
        const response = await ChatService.startOrGetConversation(targetUID);
        if (!isMounted) return;
        if (response && response.success === true && response.data) {
          const newOrExistingConvo = response.data;
          setConversations((prevConvos) => {
            const existingIndex = prevConvos.findIndex(
              (c) => c._id === newOrExistingConvo._id
            );
            let updatedConvos =
              existingIndex > -1
                ? prevConvos.map((c) =>
                    c._id === newOrExistingConvo._id ? newOrExistingConvo : c
                  )
                : [newOrExistingConvo, ...prevConvos];
            return sortConversations(updatedConvos);
          });
          setSelectedConversation(newOrExistingConvo);
          if (onChatInitiated) {
            onChatInitiated(newOrExistingConvo);
          }
        } else {
          setErrorInitiating(response?.message || "Gagal memulai percakapan.");
          if (isMounted && processedRecipientUIDRef.current === targetUID) {
            processedRecipientUIDRef.current = null;
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setErrorInitiating(
          err.message || "Terjadi kesalahan server saat memulai percakapan."
        );
        if (isMounted && processedRecipientUIDRef.current === targetUID) {
          processedRecipientUIDRef.current = null;
        }
      } finally {
        if (isMounted) {
          setIsInitiatingChat(false);
        }
      }
    };
    if (recipientToInitiateChat) {
      handleInitiate(recipientToInitiateChat);
    } else {
      if (processedRecipientUIDRef.current) {
        processedRecipientUIDRef.current = null;
      }
    }
    return () => {
      isMounted = false;
    };
  }, [
    recipientToInitiateChat,
    isLoggedIn,
    currentUserUID,
    onChatInitiated,
    isInitiatingChat,
    selectedConversation,
  ]);

  const handleSelectConversation = (conversation) => {
    if (selectedConversation?._id !== conversation._id) {
      setSelectedConversation(conversation);
    }
  };

  const handleDeselectConversation = () => {
    setSelectedConversation(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation?._id || !currentUserUID)
      return;
    setIsSendingMessage(true);
    setErrorSending("");
    const tempMessageId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempMessageId,
      senderUID: currentUserUID,
      text: newMessage,
      timestamp: new Date().toISOString(),
      type: "text",
      status: "sending",
    };
    setMessages((prevMessages) => [...prevMessages, optimisticMessage]);
    const messageTextToSend = newMessage;
    setNewMessage("");
    setTimeout(scrollToBottom, 0);
    try {
      const response = await ChatService.sendMessage(
        selectedConversation._id,
        messageTextToSend
      );
      if (response && response.success === true && response.data) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === tempMessageId
              ? { ...response.data, status: "sent" }
              : msg
          )
        );
        setConversations((prevConvos) =>
          sortConversations(
            prevConvos.map((convo) =>
              convo._id === selectedConversation._id
                ? {
                    ...convo,
                    lastMessage: response.data,
                    updatedAt: response.data.timestamp,
                  }
                : convo
            )
          )
        );
      } else {
        setErrorSending(response?.message || "Gagal mengirim pesan.");
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === tempMessageId ? { ...msg, status: "failed" } : msg
          )
        );
      }
    } catch (err) {
      setErrorSending(
        err.message || "Terjadi kesalahan server saat mengirim pesan."
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === tempMessageId ? { ...msg, status: "failed" } : msg
        )
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  if (!isLoggedIn) return null;

  const getOtherParticipantDisplayInfo = (conversation) => {
    if (!conversation || !conversation.participantInfo || !currentUserUID)
      return "Chat";
    const otherParticipantUID = conversation.participantUIDs.find(
      (uid) => uid !== currentUserUID
    );
    const participant = conversation.participantInfo[otherParticipantUID];
    return participant?.displayName || "Pengguna";
  };

  return (
    <Card className="global-chat-window-modal-version shadow-lg">
      <Card.Header className="d-flex justify-content-between align-items-center global-chat-header">
        {selectedConversation && (
          <Button
            variant="link"
            className="p-0 text-white me-2 d-md-none back-to-conversations-button"
            onClick={handleDeselectConversation}
            title="Kembali ke Daftar Percakapan"
          >
            <ArrowLeftShort size={24} />
          </Button>
        )}
        <strong
          className={`chat-title-text ${
            selectedConversation ? "with-back-button" : ""
          }`}
        >
          {selectedConversation
            ? getOtherParticipantDisplayInfo(selectedConversation)
            : "Percakapan"}
        </strong>
        <Button
          variant="link"
          className="p-0 text-white close-chat-button"
          onClick={onRequestClose}
          title="Tutup Chat"
        >
          <XLg size={18} />
        </Button>
      </Card.Header>
      <div className="global-chat-main-content">
        <div
          className={`conversation-list-panel ${
            selectedConversation ? "minimized-on-mobile" : ""
          }`}
        >
          {errorInitiating && (
            <Alert
              variant="danger"
              className="m-2 small p-2 text-center"
              onClose={() => setErrorInitiating("")}
              dismissible
            >
              {errorInitiating}
            </Alert>
          )}
          {errorConversations && (
            <Alert
              variant="danger"
              className="m-2 small p-2 text-center"
              onClose={() => setErrorConversations("")}
              dismissible
            >
              {errorConversations}
            </Alert>
          )}
          {isInitiatingChat || isLoadingConversations ? (
            <div className="text-center py-5">
              <Spinner animation="border" size="sm" />
              <p className="mb-0 mt-2 small">
                {isInitiatingChat ? "Memulai chat..." : "Memuat percakapan..."}
              </p>
            </div>
          ) : conversations.length > 0 ? (
            <ListGroup variant="flush" className="conversation-list-scrollable">
              {conversations.map((convo) => (
                <ConversationItem
                  key={convo._id}
                  conversation={convo}
                  onSelect={handleSelectConversation}
                  isActive={selectedConversation?._id === convo._id}
                  currentUserUID={currentUserUID}
                />
              ))}
            </ListGroup>
          ) : (
            !errorConversations &&
            !errorInitiating && (
              <p className="text-center text-muted p-3 small">
                Belum ada percakapan.
              </p>
            )
          )}
        </div>
        <div
          className={`message-panel ${selectedConversation ? "active" : ""}`}
        >
          {selectedConversation ? (
            <>
              <Card.Body className="global-chat-body messages-area">
                {messages.length > 0 &&
                  !isLoadingMessages &&
                  (selectedConversation.messageCount > messages.length ||
                    (selectedConversation.messageCount === undefined &&
                      messages.length >= 20)) && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="load-more-messages-btn mb-2"
                      onClick={() =>
                        loadMessages(selectedConversation._id, true, messages)
                      }
                      disabled={isLoadingMessages}
                    >
                      <ArrowUpCircle className="me-1" /> Muat Pesan Sebelumnya
                    </Button>
                  )}
                {isLoadingMessages && messages.length === 0 && (
                  <div className="text-center py-3">
                    <Spinner animation="border" size="sm" />{" "}
                    <small>Memuat pesan...</small>
                  </div>
                )}
                {errorMessages && (
                  <Alert
                    variant="danger"
                    className="small p-2 text-center"
                    onClose={() => setErrorMessages("")}
                    dismissible
                  >
                    {errorMessages}
                  </Alert>
                )}
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isSender={msg.senderUID === currentUserUID}
                  />
                ))}
                <div ref={messagesEndRef} />
                {!isLoadingMessages &&
                  messages.length === 0 &&
                  !errorMessages && (
                    <p className="text-center text-muted small mt-auto">
                      Belum ada pesan dalam percakapan ini.
                    </p>
                  )}
              </Card.Body>
              <Card.Footer className="global-chat-footer p-2">
                {errorSending && (
                  <Alert
                    variant="danger"
                    className="small p-1 mb-1 text-center"
                    onClose={() => setErrorSending("")}
                    dismissible
                  >
                    {errorSending}
                  </Alert>
                )}
                <Form onSubmit={handleSendMessage}>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={
                        isSendingMessage ||
                        isLoadingMessages ||
                        !selectedConversation
                      }
                      className="chat-input"
                      autoComplete="off"
                    />
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={
                        isSendingMessage ||
                        !newMessage.trim() ||
                        !selectedConversation
                      }
                      className="btn-brand chat-send-button"
                    >
                      {isSendingMessage ? (
                        <Spinner as="span" animation="border" size="sm" />
                      ) : (
                        <SendFill />
                      )}
                    </Button>
                  </InputGroup>
                </Form>
              </Card.Footer>
            </>
          ) : (
            <div className="no-conversation-selected">
              <ChatDots size={52} className="text-muted mb-3" />
              <p className="text-muted">Pilih atau mulai percakapan baru.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default GlobalChat;
