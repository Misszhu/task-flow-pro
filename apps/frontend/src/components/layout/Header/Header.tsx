import React from 'react';
import { Layout, Button, Space, Avatar, Dropdown, Badge } from 'antd';
import {
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { logoutUser } from 'src/store/slices/authSlice';
import { AppDispatch } from 'src/store';
import styles from './Header.module.css';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({
  collapsed,
  onToggle,
  isMobile,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const userMenuItem = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader className={styles.appHeader}>
      <div className={styles.headerLeft}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          className={styles.sidebarToggle}
        />
        <div className={styles.appTitle}>
          <h1>Task Flow Pro</h1>
        </div>
      </div>

      <div className={styles.headerRight}>
        <Space size="middle">
          <Badge count={5} size="small">
            <Button
              type="text"
              icon={<BellOutlined />}
              className={styles.notificationBtn}
            />
          </Badge>

          {isAuthenticated && user ? (
            <Dropdown
              menu={{ items: userMenuItem }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className={styles.userInfo}>
                <Avatar icon={<UserOutlined />} />
                <span className={styles.userName}>{user.name}</span>
              </div>
            </Dropdown>
          ) : (
            <Button type="primary" size="small">
              登录
            </Button>
          )}
        </Space>
      </div>
    </AntHeader>
  );
};

export default Header;
