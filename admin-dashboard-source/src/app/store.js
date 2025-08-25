import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { combineReducers } from 'redux';

// 각 Slice의 Reducer 임포트
import uiReducer from '../features/ui/uiSlice';
import authReducer from '../features/auth/authSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import permissionsReducer from '../features/permissions/permissionsSlice';
import membersReducer from '../features/members/membersSlice';
import agentLevelsReducer from '../features/agentLevels/agentLevelsSlice';
import usernameChangeReducer from '../features/usernameChange/usernameChangeSlice';

// 각 리듀서별 Persist 설정
const authPersistConfig = {
  key: 'auth',
  storage,
  stateReconciler: autoMergeLevel2
};

const uiPersistConfig = {
  key: 'ui',
  storage,
  stateReconciler: autoMergeLevel2
};

const notificationsPersistConfig = {
  key: 'notifications',
  storage,
  stateReconciler: autoMergeLevel2
};

const membersPersistConfig = {
  key: 'members',
  storage,
  stateReconciler: autoMergeLevel2
};

// Root 리듀서 구성
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  ui: persistReducer(uiPersistConfig, uiReducer),
  dashboard: dashboardReducer,
  notifications: persistReducer(notificationsPersistConfig, notificationsReducer),
  agentLevels: agentLevelsReducer,
  permissions: permissionsReducer,
  members: persistReducer(membersPersistConfig, membersReducer),
  member: persistReducer(membersPersistConfig, membersReducer), // member와 members가 같은 리듀서를 사용
  usernameChange: usernameChangeReducer
});

// 버전 관리를 위한 마이그레이션 함수
const migrations = {
  0: (state) => {
    // 초기 버전
    return state;
  },
  1: (state) => {
    // 버전 1: agent-inquiry, balance-mismatch 제거
    console.log('[Redux Persist Migration] v0 -> v1: 이전 알림 데이터 정리');
    if (state?.notifications?.notifications) {
      delete state.notifications.notifications['agent-inquiry'];
      delete state.notifications.notifications['balance-mismatch'];
    }
    return state;
  },
  2: (state) => {
    // 버전 2: 향후 마이그레이션 예약
    console.log('[Redux Persist Migration] v1 -> v2');
    return state;
  }
};

// 루트 Persist 설정
const persistConfig = {
  key: 'root',
  version: 2, // 현재 버전 (변경 시 자동 마이그레이션 실행)
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['auth', 'ui', 'notifications', 'members'],
  migrate: (state, version) => {
    console.log(`[Redux Persist] 마이그레이션 시작 - 현재 버전: ${version}, 목표 버전: ${persistConfig.version}`);
    
    // 버전이 없거나 낮은 경우 순차적으로 마이그레이션
    let migratedState = state;
    const currentVersion = version || 0;
    
    for (let v = currentVersion; v < persistConfig.version; v++) {
      if (migrations[v + 1]) {
        migratedState = migrations[v + 1](migratedState);
      }
    }
    
    return Promise.resolve(migratedState);
  }
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store 구성
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});

export const persistor = persistStore(store);
