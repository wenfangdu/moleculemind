import { MolstarContext } from "@/molstar/context";
import { CSSProperties, FC, useContext, useEffect, useMemo, useState } from "react";
import SequenceStructure from "./components/sequence-structure";
import { Select } from "antd";
import { isEqual } from "lodash";

type Props = {
  className?: string
  style?: CSSProperties
}
const SequenceView: FC<Props> = ({
  className,
  style
}) => {
  const { structuresWrappers, structureVisibleStatus } = useContext(MolstarContext)!;
  const [selectValue, setSelectValue] = useState('_all');
  const [selectOptions, setSelectOptions] = useState([{ value: '_all', label: '全部' }])

  useEffect(() => {
    const options = structuresWrappers.filter(structureWrappers => {
      return structureVisibleStatus[structureWrappers.structureKey] !== false
    }).map(structureWrappers => {
      return {
        value: structureWrappers.structureKey,
        label: structureWrappers.structureLabel
      }
    })
    options.unshift({
      value: '_all',
      label: '全部'
    })
    if (!isEqual(options, selectOptions)) {
      setSelectOptions(options)
    }
  }, [structuresWrappers, structureVisibleStatus])

  useEffect(() => {
    if (!selectOptions.find(d => d.value === selectValue)) {
      setSelectValue('_all')
    }
  }, [selectOptions])

  const displaySequence = useMemo(() => {
    if (selectValue === '_all') {
      return null
    }
    return structuresWrappers.find(d => d.structureKey === selectValue)
  }, [selectValue, structuresWrappers])

  return <div className={className} style={style}>
      <div>
        {structuresWrappers.filter(structureWrappers => {
          return structureVisibleStatus[structureWrappers.structureKey] !== false
        }).map(structureWrappers =>
          <div key={structureWrappers.structureKey}>
            {/* <div>{structureWrappers.structureLabel} </div> */}
            <SequenceStructure structureKey={structureWrappers.structureKey} structureWrappers={structureWrappers} showTitle />
          </div>
        )}
      </div>
  </div>
}

export default SequenceView