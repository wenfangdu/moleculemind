import { useCallback, useEffect, useState } from "react";
import { useSubscribe } from "./useSubscribe";
import { StateSelection } from "molstar/lib/mol-state";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { elementLabel } from "molstar/lib/mol-theme/label"
import { cloneDeep, isEqual } from "lodash";
import { getStructure, opKey, splitModelEntityId } from "./utils/sequence";
import { Structure as TStructureDetail, StructureElement, StructureProperties } from "molstar/lib/mol-model/structure";
import { useLatest, useThrottleFn } from "ahooks";
import { TChainGroup, TModelEntity, TOperator, TStructure } from "./interface/sequence";
import { TMolstarPlugin } from "./interface/utils";
import { StructureRef } from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";

// const MaxSelectOptionsCount = 1000;

function getStructures(plugin:TMolstarPlugin) {
  let results: TStructure[] = [], details = []
  const datas = plugin.state.data.select(StateSelection.Generators.rootsOfType(PluginStateObject.Molecule.Structure));
  const structureRefs = plugin.managers.structure.hierarchy.current.structures;
  
  for (const s of datas) {
    if (!s.obj?.data) continue;
    results.push({
      key: s.transform.ref,
      label: s.obj!.data.label,
      version: s.paramsNormalizedVersion,
      hashCode: s.obj?.data.hashCode,
    })
    details.push(getStructure(plugin, s.transform.ref))
  }
  return { structuresResult: results, structureDetailsResult: details, structureRefs }
}

function getStructureResults(plugin: TMolstarPlugin) {
  let {
    structuresResult,
    structureDetailsResult,
    structureRefs
  } = getStructures(plugin);

  structuresResult.forEach((structure, i) => {
    const structureDetail = structureDetailsResult[i]
    structure.modelEntities = getModelEntities(structureDetail)
    structure.modelEntities.forEach(entity => {
      entity.chainGroups = getChainOptions(structureDetail, entity.key)
      entity.chainGroups.forEach(chainGroup => {
        chainGroup.operators = getOperatorOptions(structureDetail, entity.key, chainGroup.id)
      })
    })
  })

  return {
    structuresResult,
    structureDetailsResult,
    structureRefs
  }
}

function getModelEntities(structure: TStructureDetail, polymersOnly?: string) {
  const options: TModelEntity[] = [];
  const l = StructureElement.Location.create(structure);
  const seen = new Set<string>();

  for (const unit of structure.units) {
    StructureElement.Location.set(l, structure, unit, unit.elements[0]);
    const id = StructureProperties.entity.id(l);
    const type = StructureProperties.entity.type(l);
    const modelIdx = structure.getModelIndex(unit.model);
    const key = `${modelIdx}|${id}`;
    if (seen.has(key)) continue;
    if (polymersOnly && StructureProperties.entity.type(l) !== 'polymer') continue;

    let description = StructureProperties.entity.pdbx_description(l).join(', ');
    if (structure.models.length) {
      if (structure.representativeModel) { // indicates model trajectory
        description += ` (Model ${structure.models[modelIdx].modelNum})`;
      } else if (description.startsWith('Polymer ')) { // indicates generic entity name
        description += ` (${structure.models[modelIdx].entry})`;
      }
    }
    const label = `${id}: ${description}`;
    options.push({ key, label, model: structure.models?.[modelIdx], type});
    seen.add(key);

    // if (options.length > MaxSelectOptionsCount) {
    //     return [['', 'Too many entities']];
    // }
  }

  return options;
}

function getChainOptions(structure: TStructureDetail, modelEntityId: string): TChainGroup[] {
  const options: TChainGroup[] = [];
  const l = StructureElement.Location.create(structure);
  const seen = new Set<number>();
  const [modelIdx, entityId] = splitModelEntityId(modelEntityId);

  for (const unit of structure.units) {
    StructureElement.Location.set(l, structure, unit, unit.elements[0]);
    if (structure.getModelIndex(unit.model) !== modelIdx) continue;
    if (StructureProperties.entity.id(l) !== entityId) continue;

    const id = unit.chainGroupId;
    if (seen.has(id)) continue;

    // TODO handle special case
    // - more than one chain in a unit
    const label = elementLabel(l, { granularity: 'chain', hidePrefix: true, htmlStyling: false });

    options.push({ id, label });
    seen.add(id);

    // if (options.length > MaxSelectOptionsCount) {
    //     return [[-1, 'Too many chains']];
    // }
  }

  // if (options.length === 0) options.push([-1, 'No chains']);
  return options;
}

function getOperatorOptions(structure: TStructureDetail, modelEntityId: string, chainGroupId: number): TOperator[] {
  const options: TOperator[] = [];
  const l = StructureElement.Location.create(structure);
  const seen = new Set<string>();
  const [modelIdx, entityId] = splitModelEntityId(modelEntityId);

  for (const unit of structure.units) {
    StructureElement.Location.set(l, structure, unit, unit.elements[0]);
    if (structure.getModelIndex(unit.model) !== modelIdx) continue;
    if (StructureProperties.entity.id(l) !== entityId) continue;
    if (unit.chainGroupId !== chainGroupId) continue;

    const id = opKey(l);
    if (seen.has(id)) continue;

    const label = unit.conformation.operator.name;
    options.push({ id, label });
    seen.add(id);

    // if (options.length > MaxSelectOptionsCount) {
    //     return [['', 'Too many operators']];
    // }
  }

  // if (options.length === 0) options.push(['', 'No operators']);
  return options;
}

export function useGetStructures(plugin: TMolstarPlugin) {
  const { subscribe } = useSubscribe()
  const pluginLatestRef = useLatest(plugin)
  const [structures, setStructures] = useState<TStructure[]>([])
  const [structureDetails, setStructureDetails] = useState<TStructureDetail[]>([])
  const [structureResult, setStructureResult] = useState<TStructure[]>([])
  const [structureRefs, setStructureRefs] = useState<StructureRef[]>([])

  const structuresLatest = useLatest(structures)

  const sync = useCallback(() => {
    if (!pluginLatestRef.current) {
      return;
    }
    const plugin = pluginLatestRef.current;

    const {
      structuresResult,
      structureDetailsResult,
      structureRefs,
    } = getStructureResults(plugin)

    if (isEqual(structuresResult, structuresLatest.current)) {
      return;
    }

    setStructures(structuresResult)
    setStructureDetails(structureDetailsResult)
    setStructureRefs(structureRefs)
  }, [])

  const syncThrottle = useThrottleFn(sync, {wait: 200})
  
  useEffect(() => {
    if (plugin) {
      syncThrottle.run();
      subscribe(plugin.state.events.object.updated, syncThrottle.run);
      subscribe(plugin.state.events.object.created, syncThrottle.run);
      subscribe(plugin.state.events.object.removed, syncThrottle.run);
    }
  }, [plugin])

  useEffect(() => {
    if (structures.length === structureDetails.length) {
      const result = cloneDeep(structures);
      result.forEach((structure, i) => { 
        structure.detail = structureDetails.find(detail => detail.hashCode === structure.hashCode)
        structure.ref = structureRefs.find(ref => ref.version === structure.version);
      })
      setStructureResult(result)
    }
  }, [structures, structureDetails, structureRefs])

  return {
    structures: structureResult,
  }
}