/**
 * Dashboard Data Service - API Connection Layer
 * Updated to use correct backend API endpoints
 */

import apiService from './api.js';
import { getDateRangeByPeriod } from '../utils/dateUtils.js';

console.log('🔧 Dashboard Data Service: Loading...');

/**
 * Fetch dashboard settlement data
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {Promise<Object|null>} - Dashboard settlement data or null
 */
async function fetchSettlementDashboard(period = 'daily') {
  console.log('🔍 Dashboard Service: Fetching settlement dashboard data for period:', period);
  
  try {
    // period에 따라 날짜 범위 계산
    const { startDate, endDate } = getDateRangeByPeriod(period);
    console.log(`📅 Date range for ${period}: ${startDate} ~ ${endDate}`);
    
    // API 호출 시 날짜 파라미터 추가
    const response = await apiService.settlement.getDashboard({
      startDate,
      endDate
    });
    
    console.log('✅ Dashboard Service: Successfully fetched settlement dashboard data', response.data);
    // response.data가 {success: true, data: {...}} 형태인 경우
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard Service: Error fetching settlement dashboard:', error.message);
    return null;
  }
}

/**
 * Fetch user status data
 * @returns {Promise<Object|null>} - User status data or null
 */
async function fetchUserStatus() {
  console.log('🔍 Dashboard Service: Fetching user status data');
  
  try {
    const response = await apiService.userStatus.getAll();
    console.log('✅ Dashboard Service: Successfully fetched user status data', response.data);
    // response.data가 {success: true, data: {...}} 형태인 경우
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('❌ Dashboard Service: Error fetching user status:', error.message);
    return null;
  }
}

/**
 * Fetch system metrics data
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {Promise<Object|null>} - System metrics data or null
 */
async function fetchSystemMetrics(period = 'daily') {
  console.log('🔍 Dashboard Service: Fetching system metrics for period:', period);
  
  try {
    if (period === 'daily') {
      // 일별인 경우 기존 todaySettlement API 사용
      const todaySettlement = await apiService.settlement.getTodaySettlement();
      console.log('✅ Dashboard Service: Successfully fetched today system metrics', todaySettlement.data);
      if (todaySettlement.data && todaySettlement.data.success && todaySettlement.data.data) {
        return todaySettlement.data.data;
      }
      return todaySettlement.data;
    } else {
      // 주별/월별인 경우 날짜 범위를 포함하여 API 호출
      const { startDate, endDate } = getDateRangeByPeriod(period);
      console.log(`📅 Date range for ${period}: ${startDate} ~ ${endDate}`);
      
      // daily API를 사용하여 기간별 데이터 조회
      const response = await apiService.settlement.getDaily({
        startDate,
        endDate
      });
      
      console.log('✅ Dashboard Service: Successfully fetched period system metrics', response.data);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    }
  } catch (error) {
    console.error('❌ Dashboard Service: Error fetching system metrics:', error.message);
    return null;
  }
}

/**
 * Fetch dashboard overview data (settlement dashboard)
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {Promise<Object|null>} - Dashboard overview data or null
 */
export async function getDashboardOverview(period = 'daily') {
  console.log('📊 Dashboard Service: Getting overview data for period:', period);
  return await fetchSettlementDashboard(period);
}

/**
 * Fetch user metrics data (user status)
 * @returns {Promise<Object|null>} - User metrics data or null
 */
export async function getUserMetrics() {
  console.log('👥 Dashboard Service: Getting user metrics...');
  return await fetchUserStatus();
}

/**
 * Fetch system status data (system metrics)
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {Promise<Object|null>} - System status data or null
 */
export async function getSystemStatus(period = 'daily') {
  console.log('🖥️ Dashboard Service: Getting system status for period:', period);
  return await fetchSystemMetrics(period);
}

/**
 * Fetch all dashboard data at once
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @returns {Promise<Object>} - Combined dashboard data with null fallbacks
 */
export async function getAllDashboardData(period = 'daily') {
  console.log('🎯 Dashboard Service: Fetching all dashboard data for period:', period);
  
  try {
    const [overview, userMetrics, systemStatus] = await Promise.all([
      getDashboardOverview(period),
      getUserMetrics(), // UserStatus는 period 미지원 (실시간 데이터만)
      getSystemStatus(period)
    ]);

    const result = {
      overview,
      userMetrics,
      systemStatus,
      period,
      timestamp: new Date().toISOString(),
      hasData: !!(overview || userMetrics || systemStatus)
    };

    console.log('✅ Dashboard Service: All data fetched:', result);
    return result;

  } catch (error) {
    console.error('❌ Dashboard Service: Error fetching all data:', error.message);
    return {
      overview: null,
      userMetrics: null,
      systemStatus: null,
      period,
      timestamp: new Date().toISOString(),
      hasData: false,
      error: error.message
    };
  }
}

console.log('✅ Dashboard Data Service: Loaded successfully');

// Export service info for debugging
export const SERVICE_INFO = {
  name: 'Dashboard Data Service',
  version: '2.0.0',
  endpoints: {
    SETTLEMENT_DASHBOARD: '/settlement-api/dashboard',
    USER_STATUS: '/user-status/all',
    SYSTEM_METRICS: '/settlement/today'
  },
  created: new Date().toISOString()
};

export default {
  getDashboardOverview,
  getUserMetrics,
  getSystemStatus,
  getAllDashboardData,
  SERVICE_INFO
};