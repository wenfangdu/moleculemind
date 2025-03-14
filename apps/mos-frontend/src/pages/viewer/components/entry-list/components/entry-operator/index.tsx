import { TOperator } from "@/molstar/interface/sequence";
import { Typography } from "antd";
import { FC } from "react";
import styles from '../../index.less'

type Props = {
  operator: TOperator;
}
const EntryOperator:FC<Props> = ({
  operator,
}) => {
  return <div>
    <div className={styles.labelContainer}>
    <Typography.Text ellipsis={{tooltip: operator.label}} className={styles.label}>{operator.label}</Typography.Text>
    </div>
  </div>
}

export default EntryOperator