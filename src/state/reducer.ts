import { createSlice } from "@reduxjs/toolkit";

import { getUser, saveUser } from "./thunks";

const initialState = {
  user: null,
};

const userStartLevelXpAmount = 100;

const globalSlice = createSlice({
  name: "global",
  initialState,
  selectors: {
    selectUser: (state) => state.user,
    selectExperienceNeeded: (state) =>
      calculateExperienceNeeded(state.user?.level),
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    letUserExperience: (state, action) => {
      const experience = state.user.currentXp + action.payload;

      if (experience >= calculateExperienceNeeded(state.user.level)) {
        state.user.level += 1;
        state.user.currentXp = 0;
      } else {
        state.user.currentXp = experience;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });

    builder.addCase(saveUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

function calculateExperienceNeeded(level: number) {
  return userStartLevelXpAmount * Math.pow(level, 1);
}

export const { setUser } = globalSlice.actions;
export const { letUserExperience } = globalSlice.actions;
export const { selectUser } = globalSlice.selectors;
export const { selectExperienceNeeded } = globalSlice.selectors;
export default globalSlice.reducer;
