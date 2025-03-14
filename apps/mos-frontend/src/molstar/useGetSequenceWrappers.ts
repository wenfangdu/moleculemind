import { TStrucrtureWrappers, TStructure, TWrapper } from "./interface/sequence"
import { getSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence"
import { useCallback, useEffect, useState } from "react"
import { isEmpty } from "lodash"
import { TMolstarPlugin } from "./interface/utils"
import { Representation } from "molstar/lib/mol-repr/representation"
import { MarkerAction } from "molstar/lib/mol-util/marker-action"
import { useLatest, useThrottleFn } from "ahooks"
import { SequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/wrapper"
import { useSubscribe } from "./useSubscribe"
import awaitTimeout from "@/utils/awaitTimeout"

type Props = {
  structures: TStructure[]
  plugin: TMolstarPlugin;
}

export function useGetSequenceWrappers({
  structures,
  plugin
}: Props) {
  const [structuresWrappers, setStructuresWrappers] = useState<TStrucrtureWrappers[]>([]);
  const [selections, setSelections] = useState<any[]>([])
  const structuresWrappersLatestRef = useLatest(structuresWrappers)
  const structuresLatestRef = useLatest(structures)
  const { subscribe } = useSubscribe()

  const sync = useCallback(async() => {
    await awaitTimeout()
    if (isEmpty(structuresLatestRef.current)) {
      setStructuresWrappers([])
      return;
    }
    const result = structuresLatestRef.current.map(structure => ({
      structureKey: structure.key,
      structureLabel: structure.label,
      structure,
      wrappers: getSequenceWrappers(structure)
    }))
    setStructuresWrappers(result)
  }, [plugin])

  const syncThrottle = useThrottleFn(sync, {wait: 500})

  useEffect(() => {
    if (plugin) {
      syncThrottle.run();
      subscribe(plugin.state.events.object.updated, syncThrottle.run);
      subscribe(plugin.state.events.object.created, syncThrottle.run);
      subscribe(plugin.state.events.object.removed, syncThrottle.run);
    }
  }, [plugin])

  const lociSelectionProvider = useCallback((loci: Representation.Loci, action: MarkerAction) => {
    // console.log(loci.loci, action)
    if (loci.loci.kind !== 'structure-loci') {
      return;
    }
    let index = 0
    while (!!structuresWrappersLatestRef.current[index]) {
      const wrappers = structuresWrappersLatestRef.current[index].wrappers
      // const _index = wrappers.findIndex(wrapperObj => {
      //   if (typeof wrapperObj.wrapper === 'string') {
      //     return false
      //   }
      //   return wrapperObj.wrapper.markResidue(loci.loci, action)}
      // )
      wrappers.forEach((wrapperObj, _index) => {
        if (typeof wrapperObj.wrapper === 'string') {
          return 
        }
        const changed = wrapperObj.wrapper.markResidue(loci.loci, action);
        // console.log({
        //   changed, index, _index
        // })
      })
      index++
      // if (_index !== -1) {
      //   const { markerArray } = wrappers[_index].wrapper as SequenceWrapper.Any;
      //   console.log({
      //     markerArray, index, _index
      //   })
      //   break
      // }
    }
    // const changed = wrapper.markResidue(loci.loci, action);
    // console.log('loci.loci', loci.loci, changed, action)
    // if (changed) updateMarker();
  }, [])

  useEffect(() => {
    if (!plugin) {
      return;
    }
    plugin.managers.interactivity.lociSelects.addProvider(lociSelectionProvider);

  }, [plugin])

  function getSequenceWrappers(structure: TStructure) {
    const structureWrappers: TWrapper[] = [];
    const {
      key: structureKey,
      label: structureLabel,
      modelEntities,
      detail: structureDetail,
    } = structure
    modelEntities?.forEach(entity => {
      const {
        chainGroups,
        label: entityLabel,
        key: entityKey
      } = entity
      chainGroups?.forEach(group => {
        const {
          operators,
          label: groupLabel,
          id: groupId
        } = group
        operators?.forEach(operator => {
          const {
            label: operatorLabel,
            id: operatorId
          } = operator
          // console.log({
          //     label:  `${structureLabel}|${entityLabel}|${groupLabel}|${operatorLabel}`
          // })
          structureWrappers.push({
            wrapper: getSequenceWrapper({
              structure: structureDetail!,
              modelEntityId: entityKey,
              chainGroupId: groupId,
              operatorKey: operatorId
            }, plugin.managers.structure.selection),
            chainGroupId: groupId,
            key: `${structureKey}__${entityKey}__${groupId}__${operatorId}`,
            label: `${entityLabel}|${groupLabel}|${operatorLabel}`
          });
        })
      })
    })
    return structureWrappers;
  }

  return {
    structuresWrappers
  }
}