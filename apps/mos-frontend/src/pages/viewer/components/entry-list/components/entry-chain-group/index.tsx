import { MinusSquareFilled, PlusSquareFilled } from "@ant-design/icons/lib";
import { Button, Typography } from "antd";
import { isEmpty } from "lodash";
import { FC, useState } from "react";
import EntryOperator from "../entry-operator";
import { TChainGroup } from "@/molstar/interface/sequence";
import styles from '../../index.less'

type Props = {
  chainGroup: TChainGroup;
}
const EntryChainGroup:FC<Props> = ({
  chainGroup,
}) => {
  const [expanded, setExpanded] = useState(false)
  return <div key={chainGroup.id}>
    <div onClick={() => setExpanded(!expanded)} className={styles.labelContainer}>
      <Button type="text" icon={expanded ? <MinusSquareFilled /> : <PlusSquareFilled />}/>
      <Typography.Text ellipsis={{tooltip: chainGroup.label}} className={styles.label}>{chainGroup.label}</Typography.Text>
    </div>
    {
      expanded && !isEmpty(chainGroup.operators) && <div style={{marginLeft: '8px'}}>
        {
          chainGroup.operators?.map(operator => <EntryOperator operator={operator} />)
        }  
      </div>
    }
  </div>
}

export default EntryChainGroup