import { TStrucrtureWrappers } from "@/molstar/interface/sequence";
import { FC, useState } from "react";
import SequenceWrapper from "../sequence-wrapper";
import { Button } from "antd";
import { ArrowsAltOutlined, ShrinkOutlined } from "@ant-design/icons/lib";
type Props = {
  structureWrappers: TStrucrtureWrappers
  showTitle?: boolean
  structureKey: string
}
const SequenceStructure:FC<Props> = ({
  structureWrappers,
  showTitle,
  structureKey
}) => {
  const [expanded, setExpanded] = useState(true)
  return <div>
    {showTitle && <div>
      {structureWrappers.structureLabel}
      <Button onClick={() => setExpanded(!expanded)} icon={expanded ? <ShrinkOutlined /> : <ArrowsAltOutlined />} size="small" />
    </div>}
    {
      expanded && structureWrappers.wrappers.map((sequenceWrapper, i) => {
        const wrapper = sequenceWrapper.wrapper
        if (typeof wrapper === 'string') {
          return <span key={`${i}`}>{wrapper}</span>
        }
        return <SequenceWrapper structureKey={structureKey} sequenceWrapper={sequenceWrapper} key={`${sequenceWrapper.label}_${i}`} />
      })
    }
  </div>
}

export default SequenceStructure