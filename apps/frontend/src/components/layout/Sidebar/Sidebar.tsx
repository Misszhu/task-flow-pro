import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ProjectOutlined,
  TagsOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import styles from './Sidebar.module.css';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
  onClose: () => void;
  isMobile: boolean;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onClose,
  isMobile,
  currentPath
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表板',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理',
    },
    {
      key: '/tasks',
      icon: <TagsOutlined />,
      label: '任务管理',
    },
    {
      key: '/team',
      icon: <TeamOutlined />,
      label: '团队管理',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '报告',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    if (isMobile) {
      onClose();
    }
  };

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className={`${styles.appSidebar} ${isMobile ? styles.mobile : ''}`}
      width={240}
      collapsedWidth={isMobile ? 0 : 80}
    >
      <div className={styles.sidebarLogo}>
        <h2>Task Flow</h2>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[currentPath]}
        items={menuItems}
        onClick={handleMenuClick}
        className={styles.sidebarMenu}
      />
    </Sider>
  );
};

export default Sidebar;
