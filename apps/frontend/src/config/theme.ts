import type { ThemeConfig } from 'antd';

export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#667eea',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    borderRadius: 8,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    lineHeight: 1.6,
  },
  components: {
    Card: {
      borderRadius: 12,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
    Badge: {
      colorError: '#ff4d4f',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
    },
  },
};

export default theme;
