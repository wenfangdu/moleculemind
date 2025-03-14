import { FC, useContext } from "react";
import EntryStructure from "./components/entry-structure";
import { PluginCommands } from "molstar/lib/mol-plugin/commands";
import { MolstarContext } from "@/molstar/context";
import { TStructure } from "@/molstar/interface/sequence";
import { useLatest } from "ahooks";
import styles from './index.less'
import { ZoomInOutlined, ZoomOutOutlined } from "@ant-design/icons";
import { Button } from "antd";
type Props = {
  className?: string
  onHandleAddData: () => void;
}
const EntryList:FC<Props> = ({
  className,
  onHandleAddData,
}) => {
  const {
    structures,
    structureCells,
    molstarPlugin,
    updateStructureVisibleStatus,
    structureVisibleStatus,
    zoomIn,
    zoomOut,
  } = useContext(MolstarContext)!;
  const structureVisibleStatusLatestRef = useLatest(structureVisibleStatus);

  function handleStructureRemove(structure: TStructure, index: number) {
    PluginCommands.State.RemoveObject(molstarPlugin!, { state: structureCells[index].parent!, ref: structure.key, removeParentGhosts: true });
  }
  function handleStructureVisible(structure: TStructure, index: number) {
    PluginCommands.State.ToggleVisibility(molstarPlugin!, { state: structureCells[index].parent!, ref: structure.key });
    updateStructureVisibleStatus(structure.key, structureVisibleStatusLatestRef.current[structure.key] === false ? true : false)
  }

  return <div className={className}>
    <div className={styles.header}>
      <Button icon={<ZoomInOutlined />} onClick={zoomIn}>zoomIn</Button>
      <Button icon={<ZoomOutOutlined />} onClick={zoomOut}>zoomOut</Button>
    </div>
    {structures.map((structure, index) => <EntryStructure
      structure={structure}
      key={structure.key}
      onVisibleChange={() => handleStructureVisible(structure, index)}
      onRemove={() => handleStructureRemove(structure, index)}
    />)}
  </div>
}

export default EntryList