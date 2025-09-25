import React from 'react';
import { Layout } from 'antd';
import styles from './Footer.module.css';

const { Footer: AntFooter } = Layout;

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <AntFooter className={`${styles.appFooter} ${className || ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerLeft}>
          <span>© 2024 Task Flow Pro. All rights reserved.</span>
        </div>
        <div className={styles.footerRight}>
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/help">Help</a>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
