import { createAsyncThunk } from "@reduxjs/toolkit";

import { DatabaseService } from "../services/database";
import { User } from "../types";

const getUser = createAsyncThunk("user/getUser", async () => {
  const items = await DatabaseService.runQuery("SELECT * FROM User");

  return items.rows.item(0);
});

const saveUser = createAsyncThunk("user/saveUser", async (user: User) => {
  await DatabaseService.runQuery(
    `UPDATE User SET level = ${user.level}, currentXp = ${user.currentXp}`,
  );

  return user;
});

export { getUser, saveUser };
