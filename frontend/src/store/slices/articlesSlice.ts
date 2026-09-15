import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HealthPackage, HealthBlog } from '../../types';

interface ArticlesState {
  healthPackages: HealthPackage[];
  healthBlogs: HealthBlog[];
}

const initialState: ArticlesState = {
  healthPackages: [],
  healthBlogs: [],
};

export const articlesSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setHealthBlogs: (state, action: PayloadAction<HealthBlog[]>) => {
      state.healthBlogs = action.payload;
    },
    addArticleLocal: (state, action: PayloadAction<HealthBlog>) => {
      state.healthBlogs.unshift(action.payload);
    },
    updateArticleLocal: (state, action: PayloadAction<HealthBlog>) => {
      const idx = state.healthBlogs.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) {
        state.healthBlogs[idx] = action.payload;
      }
    },
    deleteArticleLocal: (state, action: PayloadAction<string>) => {
      state.healthBlogs = state.healthBlogs.filter(a => a.id !== action.payload);
    },
  },
});

export const {
  setHealthBlogs,
  addArticleLocal,
  updateArticleLocal,
  deleteArticleLocal,
} = articlesSlice.actions;

export default articlesSlice.reducer;
