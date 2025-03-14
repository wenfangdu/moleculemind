import { isEmpty } from "lodash"
import { StateObjectCell } from "molstar/lib/mol-state"
import { useEffect, useState } from "react"
import { TStructure } from "./interface/sequence"
import { TMolstarPlugin } from "./interface/utils"

type Props = {
  structures: TStructure[]
  plugin: TMolstarPlugin
}
export function useGetStructureCells({
  structures, plugin
}: Props) {
  const [structureCells, setStructureCells] = useState<StateObjectCell[]>([])
  useEffect(() => {
    if (isEmpty(structures) || !plugin) {
      setStructureCells([])
      return;
    }
    const state = plugin.state.data;
    const ref = state.tree.root.ref;
    const rootCell = state.cells.get(ref)!
    const entrys = rootCell.parent!.tree.children.get(rootCell.transform.ref);
    const entrysCells = entrys.map(c => rootCell.parent!.cells.get(c!)!)
    setStructureCells([...entrysCells])
  }, [plugin, structures])

  return { structureCells }
}