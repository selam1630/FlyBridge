import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import socket from '../socket';
import DashboardHeader from '../dashboardheader';

const COLORS = {
  BG: '#F7F8FC',
  PRIMARY: '#2D4B46',
  ACCENT: '#FFB733',
  CARD: '#FFFFFF',
};

const AgentChat = ({ route }) => {
  const { agentId } = route?.params || {};

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    socket.connect();
    console.log(`🟢 Agent connected: ${agentId || 'No Agent ID'}`);

    socket.emit('getUsersWithMessages', agentId);

    socket.on('usersList', (list) => {
      setUsers(list.sort((a, b) => new Date(b.lastCreatedAt) - new Date(a.lastCreatedAt)));
    });

    socket.on('loadMessages', (msgs) => {
      const sorted = msgs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sorted);
    });

    socket.on('receiveMessage', (msg) => {
      if (selectedUser && msg.userId === selectedUser.userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on('newUserMessage', (msg) => {
      socket.emit('getUsersWithMessages', agentId);
      if (selectedUser && msg.userId === selectedUser.userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off('usersList');
      socket.off('loadMessages');
      socket.off('receiveMessage');
      socket.off('newUserMessage');
      socket.disconnect();
      console.log('🔴 Agent disconnected');
    };
  }, [agentId, selectedUser]);

  const selectUser = (user) => {
    if (selectedUser) {
      socket.emit('leaveRoom', selectedUser.userId);
    }
    setSelectedUser(user);
    socket.emit('joinRoom', user.userId);
  };

  const sendMessage = () => {
    if (!input.trim() || !selectedUser) return;

    const data = {
      userId: selectedUser.userId,
      agentId,
      sentBy: 'agent',
      message: input.trim(),
    };

    socket.emit('sendMessage', data);
    setInput('');
    setMessages((prev) => [...prev, { ...data, createdAt: new Date().toISOString() }]);
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.userItem,
        selectedUser?.userId === item.userId && styles.selectedUser
      ]}
      onPress={() => selectUser(item)}
    >
      <Text style={styles.userName}>{item.userName}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.sentBy === 'agent' ? styles.agentMsg : styles.userMsg
    ]}>
      <Text>{item.message}</Text>
      <Text style={styles.timeText}>
        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
    <View style={styles.leftPane}>
      <Text style={styles.title}>Users</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
      />
    </View>

    <View style={styles.chatPane}>
      {/* ✅ Add DashboardHeader here */}
      <DashboardHeader user={{ fullName: 'Agent Name', email: 'agent@example.com' }} />

      {selectedUser ? (
        <>
          <Text style={styles.chatHeader}>{selectedUser.userName}</Text>
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id || index.toString()}
          />
          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type a reply..."
              style={styles.input}
            />
            <TouchableOpacity onPress={sendMessage} disabled={!input.trim()}>
              <Ionicons name="send" size={24} color={COLORS.ACCENT} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.noChat}>
          <Text>Select a user to start chatting</Text>
        </View>
      )}
    </View>
  </KeyboardAvoidingView>
);

};

export default AgentChat;

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.BG },
  leftPane: { width: '35%', backgroundColor: COLORS.CARD, padding: 10, borderRightWidth: 1, borderColor: '#ddd' },
  chatPane: { flex: 1, padding: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  userItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  selectedUser: { backgroundColor: '#FFEBC1' },
  userName: { fontWeight: 'bold' },
  lastMessage: { fontSize: 12, color: '#555' },
  chatHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  messageBubble: { padding: 8, marginVertical: 4, borderRadius: 8, maxWidth: '80%' },
  userMsg: { backgroundColor: '#FFF', alignSelf: 'flex-start' },
  agentMsg: { backgroundColor: COLORS.ACCENT, alignSelf: 'flex-end' },
  timeText: { fontSize: 10, color: '#333', opacity: 0.6, marginTop: 3, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#ddd', paddingTop: 5 },
  input: { flex: 1, padding: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginRight: 8 },
  noChat: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
