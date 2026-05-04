import { create } from 'zustand';
import api from '../lib/api';

const useFeedStore = create((set, get) => ({
  posts: [],
  loading: false,
  page: 1,
  hasMore: true,
  filter: 'recent',

  fetchPosts: async (reset = false) => {
    const { loading, hasMore, page, filter } = get();
    if (loading || (!reset && !hasMore)) return;

    const nextPage = reset ? 1 : page;
    set({ loading: true });

    try {
      const posts = await api.get(`/posts?page=${nextPage}&limit=20&filter=${filter}`);
      set((state) => ({
        posts: reset ? posts : [...state.posts, ...posts],
        page: nextPage + 1,
        hasMore: posts.length === 20,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  setFilter: (filter) => {
    set({ filter, posts: [], page: 1, hasMore: true });
    get().fetchPosts(true);
  },

  updatePostLike: (postId, liked, likeCount) => {
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, _count: { ...p._count, likes: likeCount }, liked } : p
      ),
    }));
  },
}));

export default useFeedStore;
