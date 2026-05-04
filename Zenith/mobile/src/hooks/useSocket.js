import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

async function getSocket() {
  if (socket?.connected) return socket;
  const token = await AsyncStorage.getItem('@zenith_token');
  if (!token) return null;
  socket = io('http://localhost:3001', {
    auth: { token },
    transports: ['websocket'],
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });
  return socket;
}

export function useSocket(handlers = {}) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    let sock = null;
    getSocket().then((s) => {
      if (!s) return;
      sock = s;
      Object.entries(handlersRef.current).forEach(([event, fn]) => {
        s.on(event, (...args) => handlersRef.current[event]?.(...args));
      });
    });
    return () => {
      if (sock) {
        Object.keys(handlersRef.current).forEach((event) => sock.off(event));
      }
    };
  }, []);
}

export async function emitLike(postId) {
  const s = await getSocket();
  s?.emit('post:like', { postId });
}
