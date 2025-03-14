import { FC, useCallback, useContext } from "react";
import styles from './index.less'
import { MolstarContext } from "@/molstar/context";
import { Button, Tooltip } from "antd";
import { isEmpty } from "lodash";
import { StructureComponentRef } from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";

const WorkspaceToolbar:FC = () => {
  const { selections, molstarPlugin, changeColor, setDistance } = useContext(MolstarContext)!;
  
  return <div className={styles.root}>
    {
      selections.length === 2 && <Tooltip title="计算选择的两个AA的距离">
      <Button type="text" size="small" disabled={isEmpty(selections) || selections.length < 2} onClick={() => setDistance(selections[0], selections[1])}>Distance</Button>
    </Tooltip>
    }
    <Button type="text" size="small" disabled={isEmpty(selections)} onClick={changeColor}>changeColor</Button>
  </div>
}

export default WorkspaceToolbar