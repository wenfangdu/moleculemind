import { Outlet } from 'umi';
import styles from './basic.less';
import { useMemo } from 'react';
import { EventProvider, TEventProvider } from '@/helper';
import { Button, Tooltip } from 'antd';
import { FolderAddFilled } from '@ant-design/icons/lib';

export default function Layout() {
  const context = useMemo(() => {
    return {
      eventProvider: new (EventProvider as any)() as TEventProvider
    }
  }, [])
  function handleBtnClick(type: string, subType?: string) {
    context.eventProvider.trigger({
      type, subType
    })
  }

  return (
    <div className={styles.root}>
            <div className={styles.navs}>
              <div className={styles.logo}>MOS</div>
              <div className={styles.toolbar}>
                <Tooltip title="data" trigger="hover" placement='right'>
                  <Button className={styles.btn} onClick={() => handleBtnClick('data')} icon={<FolderAddFilled />} type="text"></Button>
                </Tooltip>
              </div>
            </div>
            <Outlet context={context} />
    </div>
  );
}
