import { createSlice } from "@reduxjs/toolkit";
import { signedOut } from "./authSlice";

// Small piece of UI state shared by the chat screens: which order's chat is
// open, and which filter chip the admin inbox has selected.
// inboxFilter: "all" | "pending" | "paid" | "failed"
const chatUiSlice = createSlice({
  name: "chatUi",
  initialState: { selectedOrderId: null, inboxFilter: "all" },
  reducers: {
    selectOrder(state, { payload }) {
      state.selectedOrderId = payload || null;
    },
    setInboxFilter(state, { payload }) {
      state.inboxFilter = payload;
    },
  },
  extraReducers: (builder) => {
    // Never carry one account's open chat into the next sign-in.
    builder.addCase(signedOut, () => ({ selectedOrderId: null, inboxFilter: "all" }));
  },
});

export const { selectOrder, setInboxFilter } = chatUiSlice.actions;
export const selectSelectedOrderId = (s) => s.chatUi.selectedOrderId;
export const selectInboxFilter = (s) => s.chatUi.inboxFilter;

export default chatUiSlice.reducer;
