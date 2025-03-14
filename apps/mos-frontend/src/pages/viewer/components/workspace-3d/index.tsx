import { MolstarContext } from "@/molstar/context";
import { MolStarViewport } from "@/molstar/viewport";
import { CSSProperties, FC, useCallback, useContext, useMemo } from "react";
import styles from './index.less'
import classNames from "classnames";
import { Button } from "antd";
import WorkspaceToolbar from "./components/toolbar";

type Props = {
  className?: string
  style?: CSSProperties
  onHandleAddData: () => void
}
const Workspace3D:FC<Props> = ({
  className,
  style,
  onHandleAddData,
}) => {
  const {
    molstarPlugin,
    structures
  } = useContext(MolstarContext)!;
  
  if (!molstarPlugin || structures.length === 0) {
    return <div className={classNames(className, styles.emptyData)} style={style}>
      请<Button onClick={onHandleAddData} type="link" size="small">加载数据</Button>以查看3D模型
    </div>
  }

  return <div className={classNames(className, styles.root)} style={style}>
    <MolStarViewport plugin={molstarPlugin} />
    <WorkspaceToolbar />
    {/* {RenderViewPort} */}
  </div>
}

export default Workspace3D