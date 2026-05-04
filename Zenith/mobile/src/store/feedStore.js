import { create } from 'zustand';
import api from '../lib/api';

const useFeedStore = create((set, get) => ({
  posts: [],
  page: 1,
  hasMore: true,
  filter: 'recent',
  loading: false,

  fetchPosts: async () => {
    if (get().loading) return;
    set({ loading: true, posts: [], page: 1, hasMore: true });
    try {
      const data = await api.get(`/posts?page=1&limit=10&filter=${get().filter}`);
      set({ posts: data.posts || data, hasMore: (data.posts || data).length === 10, page: 2 });
    } catch {}
    set({ loading: false });
  },

  loadMore: async () => {
    const { loading, hasMore, page, filter, posts } = get();
    if (loading || !hasMore) return;
    set({ loading: true });
    try {
      const data = await api.get(`/posts?page=${page}&limit=10&filter=${filter}`);
      const newPosts = data.posts || data;
      set({ posts: [...posts, ...newPosts], hasMore: newPosts.length === 10, page: page + 1 });
    } catch {}
    set({ loading: false });
  },

  setFilter: (filter) => {
    set({ filter });
    get().fetchPosts();
  },

  updatePostLike: (postId, liked, count) =>
    set((s) => ({
      posts: s.posts.map((p) =>
        p.id === postId ? { ...p, liked, _count: { ...p._count, likes: count } } : p
      ),
    })),

  prependPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),
}));

export default useFeedStore;
