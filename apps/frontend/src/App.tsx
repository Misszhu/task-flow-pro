import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import store from './store';
import AppRouter from './router/AppRouter';
import { theme } from './config/theme';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider theme={theme} locale={zhCN}>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
