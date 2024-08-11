"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { v4 as uuidv4 } from "uuid";
import {
  db,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "../firebaseConfig"; // Import Firebase

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "chats"));
        const chatList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChats(chatList);
        if (chatList.length > 0) {
          setActiveChatId(chatList[0].id); // Set the first chat as active if any
        }
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      const fetchMessages = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, "messages"));
          const messageList = querySnapshot.docs
            .filter((doc) => doc.data().chatId === activeChatId)
            .map((doc) => doc.data().messages)
            .flat();
          setMessages(messageList);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

      fetchMessages();
    }
  }, [activeChatId]);

  const sendMessage = async () => {
    const newMessages = [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ];

    setMessage("");
    setMessages(newMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessages),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });

        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + result,
            },
          ];
        });
      }

      // Save the messages to Firebase
      if (activeChatId) {
        await addDoc(collection(db, "messages"), {
          chatId: activeChatId,
          messages: newMessages,
          timestamp: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startNewChat = async () => {
    try {
      const newChatRef = await addDoc(collection(db, "chats"), {
        name: `Chat ${chats.length + 1}`,
        createdAt: serverTimestamp(),
      });

      setChats((chats) => [
        ...chats,
        { id: newChatRef.id, name: `Chat ${chats.length + 1}` },
      ]);
      setActiveChatId(newChatRef.id);
      setMessages([]); // Clear current chat messages
      setMessage(""); // Clear input field
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  return (
    <Box width="100vw" height="100vh" display="flex" bgcolor="#333">
      {/* Sidebar */}
      <Box
        width={sidebarOpen ? { xs: "100px", sm: "200px" } : 0}
        bgcolor="#333"
        display="flex"
        flexDirection="column"
        p={2}
        transition="width 0.3s ease"
        overflow="hidden"
        position="relative"
        sx={{
          visibility: sidebarOpen ? "visible" : "hidden",
          opacity: sidebarOpen ? 1 : 0,
        }}
      >
        <Typography
          variant="h6"
          color="#e0e0e0"
          gutterBottom
          sx={{ mt: 6, visibility: sidebarOpen ? "visible" : "hidden" }}
        >
          Chats
        </Typography>
        <List
          sx={{
            visibility: sidebarOpen ? "visible" : "hidden",
            opacity: sidebarOpen ? 1 : 0,
            transition: "visibility 0.3s ease, opacity 0.3s ease",
          }}
        >
          {chats.map((chat) => (
            <ListItem
              button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
            >
              <ListItemText primary={chat.name} sx={{ color: "#e0e0e0" }} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Toggle and New Chat Buttons */}
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        position="absolute"
        top={16}
        left={sidebarOpen ? { xs: "100px", sm: "200px" } : 16}
        transition="left 0.3s ease"
        zIndex={1200}
      >
        <IconButton
          color="primary"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
        >
          <ViewSidebarRoundedIcon />
        </IconButton>
        <IconButton
          color="primary"
          aria-label="new chat"
          onClick={startNewChat}
          sx={{ ml: 1 }}
        >
          <AddCircleOutlineIcon />
        </IconButton>
      </Box>

      {/* Chat Interface */}
      <Box
        flex={1}
        display="flex"
        flexDirection="column"
        marginLeft={sidebarOpen ? { xs: "100px", sm: "200px" } : 0}
        sx={{
          transition: "margin-left 0.3s ease",
          overflow: "hidden",
          width: "100%",
        }}
      >
        <Box
          flex={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={1}
          bgcolor="#333"
        >
          <Stack
            direction="column"
            spacing={2}
            overflow="auto"
            sx={{
              p: 3,
              width: "100%",
              height: "100%",
              maxHeight: "65vh",
              borderRadius: 2,
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#616161",
                borderRadius: "8px",
              },
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
                sx={{
                  mb: 1,
                }}
              >
                <Box
                  bgcolor={message.role === "assistant" ? "#333" : "#424242"}
                  color={message.role === "assistant" ? "#e0e0e0" : "#fff"}
                  borderRadius={2}
                  p={2}
                  sx={{
                    maxWidth: "75%",
                    wordWrap: "break-word",
                  }}
                >
                  <Typography
                    variant="body1"
                    component="span"
                    sx={{
                      fontFamily: message.content.includes("`")
                        ? "Monospace"
                        : "sans-serif",
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid #333",
              width: "100%",
              borderRadius: 2,
              position: "relative",
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Type a message"
                variant="outlined"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && message.trim()) {
                    sendMessage();
                    e.preventDefault(); // Prevents default form submission
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#424242",
                    color: "#e0e0e0",
                    "& fieldset": {
                      borderColor: "#616161",
                    },
                    "&:hover fieldset": {
                      borderColor: "#757575",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                disabled={!message.trim()}
                sx={{
                  textTransform: "none",
                  bgcolor: "#1976d2",
                  "&:hover": {
                    bgcolor: "#1565c0",
                  },
                }}
              >
                Send
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
