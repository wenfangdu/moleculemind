import { Model, Structure } from "molstar/lib/mol-model/structure";
import { StructureRef } from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";
import { SequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/wrapper"
export type TStructure = {
  key: string
  label: string;
  version: string;
  modelEntities?: TModelEntity[];
  detail?: TStructureDetail
  ref?: StructureRef
  hashCode?: number;
}

export type TModelEntity = {
  key: string;
  label: string;
  chainGroups?: TChainGroup[]
  model: Model
  type: string
}
export type TChainGroup = {
  id: number;
  label: string;
  operators?: TOperator[]
}
export type TOperator = {
  id: string;
  label: string;
}

export type TWrapper = { wrapper: (string | SequenceWrapper.Any), label: string, chainGroupId: number, key: string }

export type TStrucrtureWrappers = {
  structureKey: string;
  structureLabel: string;
  structure: TStructure;
  wrappers: TWrapper[]
}

export type TStructureDetail = Structure