import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import styles from './AppLayout.module.css';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
  onSidebarToggle?: (collapsed: boolean) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = true,
  showHeader = true,
  showFooter = true,
  sidebarCollapsed = false,
  onSidebarToggle,
}) => {
  const [collapsed, setCollapsed] = useState(sidebarCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // 检测移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 移动端自动收起侧边栏
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  const handleSidebarToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onSidebarToggle?.(newCollapsed);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setCollapsed(true);
    }
  };

  return (
    <Layout className={styles.appLayout}>
      {showHeader && (
        <Header
          collapsed={collapsed}
          onToggle={handleSidebarToggle}
          isMobile={isMobile}
        />
      )}
      
      <Layout className={styles.appLayoutBody}>
        {showSidebar && (
          <Sidebar
            collapsed={collapsed}
            onClose={handleSidebarClose}
            isMobile={isMobile}
            currentPath={location.pathname}
          />
        )}
        
        <Layout className={styles.appLayoutContent}>
          <Content className={styles.appContent}>
            {children}
          </Content>
          
          {showFooter && <Footer />}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
