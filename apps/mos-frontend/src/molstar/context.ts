import React, { RefObject, useCallback, useEffect, useState } from "react";
import { useCreatePluginUI } from "./useCreatePluginUI";
import { useGetStructures } from "./useGetStructures";
import { useGetStructureCells } from "./useGetStructureCells";
import { StateObjectCell } from "molstar/lib/mol-state";
import { TStrucrtureWrappers, TStructure } from "./interface/sequence";
import { useGetSequenceWrappers } from "./useGetSequenceWrappers";
import { useLatest } from "ahooks";
import { cloneDeep } from "lodash";
import { TMolstarPlugin, TSelection } from "./interface/utils";
import { useGetSelection } from "./useGetSelection";
import useHandleChangeColor from "./useHandleChangeColor";
import useHandleZoom from "./useHandleZoom";
import { PolymerSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/polymer";
import { HeteroSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/hetero";
import { TLocation } from "@/interface";
import useSetDistance from "./useSetDistance";

type TStructureVisibleStatus = { [propName: string]: boolean };

type TMolstarContext = {
  molstarPlugin: TMolstarPlugin;
  structures: TStructure[];
  structureCells: StateObjectCell[]
  structuresWrappers: TStrucrtureWrappers[]
  structureVisibleStatus: TStructureVisibleStatus
  updateStructureVisibleStatus: (key: string, status: boolean) => void;
  selections: TLocation[]
  handleRangeSelection: (wrapper: PolymerSequenceWrapper | HeteroSequenceWrapper, _start: number, _end: number, structureKey: string, wrapperKey: string) => void
  changeColor: () => void
  zoomIn: () => void
  zoomOut: () => void
  setDistance: (a: TLocation, b: TLocation) => void
}

export const MolstarContext = React.createContext<TMolstarContext | undefined>(undefined)

export function useGetMolstarContext(viewContainerRef: RefObject<HTMLDivElement>): TMolstarContext {
  const { molstarPlugin } = useCreatePluginUI(viewContainerRef)

  const { structures } = useGetStructures(molstarPlugin!)
  const { structuresWrappers } = useGetSequenceWrappers({ structures, plugin: molstarPlugin! })
  const { structureCells } = useGetStructureCells({ structures, plugin: molstarPlugin! })
  const [structureVisibleStatus, setStructureVisibleStatus] = useState<TStructureVisibleStatus>({})

  const structureVisibleStatusLatestRef = useLatest(structureVisibleStatus);
  const updateStructureVisibleStatus = useCallback((key: string, status: boolean) => {
    const structureVisibleStatusLatest = cloneDeep(structureVisibleStatusLatestRef.current);
    structureVisibleStatusLatest[key] = status;
    setStructureVisibleStatus(structureVisibleStatusLatest);
  }, [])

  const { selections, handleRangeSelection } = useGetSelection({
    molstarPlugin: molstarPlugin!, structures,
    structuresWrappers,
    structureCells,
  })

  const { changeColor } = useHandleChangeColor({ plugin: molstarPlugin!, selections, structures })

  const { setDistance } = useSetDistance({molstarPlugin})
  const {
    zoomIn,
    zoomOut,
  } = useHandleZoom({ molstarPlugin: molstarPlugin! })

  return {
    molstarPlugin: molstarPlugin!,
    structures,
    structureCells,
    structuresWrappers,
    structureVisibleStatus,
    updateStructureVisibleStatus,
    selections,
    handleRangeSelection,
    changeColor,
    zoomIn,
    zoomOut,
    setDistance
  }
}