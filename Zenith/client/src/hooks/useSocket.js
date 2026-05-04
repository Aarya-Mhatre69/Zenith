import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function useSocket(handlers = {}) {
  const user = useAuthStore((s) => s.user);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    if (!s.connected) s.connect();

    Object.entries(handlersRef.current).forEach(([event, fn]) => {
      s.on(event, fn);
    });

    return () => {
      Object.keys(handlersRef.current).forEach((event) => {
        s.off(event);
      });
    };
  }, [user]);
}

export function joinPost(postId) {
  getSocket().emit('join:post', postId);
}

export function leavePost(postId) {
  getSocket().emit('leave:post', postId);
}
