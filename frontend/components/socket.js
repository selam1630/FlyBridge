import { API_BASE_URL } from '../config/api.js';
import { io } from 'socket.io-client';

const SOCKET_URL = API_BASE_URL;
const socket = io(SOCKET_URL, { autoConnect: false });

export default socket;
