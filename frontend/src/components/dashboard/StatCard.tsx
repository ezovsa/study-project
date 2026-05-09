import React from 'react';
import styles from './StatCard.module.css';

interface Props {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

export default function StatCard({ title, value, icon, color, sub }: Props) {
  return (
    <div className={styles.card} style={{ '--accent': color } as React.CSSProperties}>
      <div className={styles.topBar} />
      <div className={styles.body}>
        <div>
          <div className={styles.title}>{title}</div>
          <div className={styles.value}>{value}</div>
          {sub && <div className={styles.sub}>{sub}</div>}
        </div>
        <div className={styles.icon}>{icon}</div>
      </div>
    </div>
  );
}