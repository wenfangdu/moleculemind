import { DeleteOutlined, EyeInvisibleOutlined, EyeOutlined, MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons/lib";
import { Button, Typography } from "antd";
import { isEmpty } from "lodash";
import { FC, useState } from "react";
import EntryModelEntity from "../entry-model-entity";
import { TStructure } from "@/molstar/interface/sequence";
import styles from '../../index.less'

type Props = {
  structure: TStructure;
  onRemove: () => void
  onVisibleChange: () => void
}
const EntryStructure: FC<Props> = ({
  structure,
  onRemove,
  onVisibleChange
}) => {
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(true);
  function handleRemove(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    onRemove()
  }
  function handleVisibleChange(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.preventDefault()
    e.stopPropagation()
    e.nativeEvent.stopImmediatePropagation()
    onVisibleChange()
    setVisible(!visible)
  }

  return <div key={structure.key}>
    <div onClick={() => setExpanded(!expanded)} className={styles.labelContainer}>
      <Button type="text" icon={expanded ? <MinusSquareFilled /> : <PlusSquareFilled />} />
      <Typography.Text ellipsis={{tooltip: structure.label}} className={styles.label}>{structure.label}</Typography.Text>
      <div className={styles.labelActions}>
        <Button type="text" onClick={e => handleRemove(e)} icon={<DeleteOutlined />} />
        <Button type="text" onClick={e => handleVisibleChange(e)} icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />} />
      </div>
    </div>
    {
      expanded && !isEmpty(structure.modelEntities) && <div style={{ marginLeft: '8px' }}>
        {
          structure.modelEntities?.map(modelEntity => <EntryModelEntity modelEntity={modelEntity} />)
        }
      </div>
    }
  </div>
}

export default EntryStructure