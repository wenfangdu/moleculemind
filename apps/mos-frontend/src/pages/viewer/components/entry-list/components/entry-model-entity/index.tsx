import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons/lib";
import { Button, Typography } from "antd";
import { isEmpty } from "lodash";
import { FC, useState } from "react";
import EntryChainGroup from "../entry-chain-group";
import { TModelEntity } from "@/molstar/interface/sequence";
import styles from '../../index.less'

type Props = {
  modelEntity: TModelEntity;
}
const EntryModelEntity:FC<Props> = ({
  modelEntity,
}) => {
  const [expanded, setExpanded] = useState(false)
  return <div key={modelEntity.key}>
    <div onClick={() => setExpanded(!expanded)} className={styles.labelContainer}>
      <Button type="text" icon={expanded ? <MinusSquareFilled /> : <PlusSquareFilled />}/>
      <Typography.Text ellipsis={{tooltip: modelEntity.label}} className={styles.label}>{modelEntity.label}</Typography.Text>
    </div>
    {
      expanded && !isEmpty(modelEntity.chainGroups) &&  <div style={{marginLeft: '8px'}}>
      {
        modelEntity.chainGroups?.map(chainGroup => <EntryChainGroup chainGroup={chainGroup} />)
      }  
    </div>
    }
  </div>
}

export default EntryModelEntity