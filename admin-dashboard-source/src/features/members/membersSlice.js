import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  members: [],
  filter: {
    dateRange: null,
    memberType: '',
    memberStatus: '',
    connectionStatus: ''
  },
  tableSettings: {
    visibleColumns: {
      checked: true,
      rowNum: true,
      type: true,
      username: true,
      connectionStatus: true,
      onlineStatus: true,
      api: false,
      paymentStatus: true,
      balance: true,
      gameMoney: true,
      depositWithdrawal: true,
      rollingPercent: true,
      rollingAmount: true,
      realName: true,
      bank: false,
      accountNumber: false,
      lastGame: false,
      lastConnectedAt: false,
      createdAt: false,
      profit_casino: true,
      profit_slot: true,
      profit_total: true,
      actions: true
    },
    columnOrder: null,
    columnState: null,
    sortConfig: {
      key: 'rowNum',
      direction: 'asc'
    },
    pageSize: 25,
    sequentialPageNumbers: false,
    pinnedColumns: ['checked', 'rowNum', 'type', 'username'],
    hasPinnedColumns: true
  },
  status: 'idle',
  error: null
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    resetFilter: (state) => {
      state.filter = initialState.filter;
    },
    updateTableSettings: (state, action) => {
      state.tableSettings = {
        ...state.tableSettings,
        ...action.payload
      };
    },
    updateVisibleColumns: (state, action) => {
      state.tableSettings.visibleColumns = {
        ...state.tableSettings.visibleColumns,
        ...action.payload
      };
    },
    updateColumnOrder: (state, action) => {
      state.tableSettings.columnOrder = action.payload;
    },
    updateColumnState: (state, action) => {
      state.tableSettings.columnState = action.payload;
    },
    updateSortConfig: (state, action) => {
      state.tableSettings.sortConfig = action.payload;
    },
    updatePageSize: (state, action) => {
      state.tableSettings.pageSize = action.payload;
    },
    updateSequentialPageNumbers: (state, action) => {
      state.tableSettings.sequentialPageNumbers = action.payload;
    },
    updatePinnedColumns: (state, action) => {
      state.tableSettings.pinnedColumns = action.payload;
    },
    updateHasPinnedColumns: (state, action) => {
      state.tableSettings.hasPinnedColumns = action.payload;
    },
    updateMemberBalance: (state, action) => {
      const { userId, balance } = action.payload;
      const member = state.members.find(m => m.id === userId);
      if (member) {
        member.balance = balance;
      }
    }
  }
});

export const { 
  setMembers, 
  setFilter, 
  resetFilter,
  updateTableSettings,
  updateVisibleColumns,
  updateColumnOrder,
  updateColumnState,
  updateSortConfig,
  updatePageSize,
  updateSequentialPageNumbers,
  updatePinnedColumns,
  updateHasPinnedColumns,
  updateMemberBalance
} = membersSlice.actions;

// Selectors
export const selectMembers = (state) => state.members.members;
export const selectFilter = (state) => state.members.filter;
export const selectMembersStatus = (state) => state.members.status;
export const selectMembersError = (state) => state.members.error;
export const selectTableSettings = (state) => state.members.tableSettings;
export const selectVisibleColumns = (state) => state.members.tableSettings.visibleColumns;
export const selectColumnOrder = (state) => state.members.tableSettings.columnOrder;
export const selectColumnState = (state) => state.members.tableSettings.columnState;
export const selectSortConfig = (state) => state.members.tableSettings.sortConfig;
export const selectPageSize = (state) => state.members.tableSettings.pageSize;
export const selectSequentialPageNumbers = (state) => state.members.tableSettings.sequentialPageNumbers;
export const selectPinnedColumns = (state) => state.members.tableSettings.pinnedColumns;
export const selectHasPinnedColumns = (state) => state.members.tableSettings.hasPinnedColumns;

export default membersSlice.reducer; 