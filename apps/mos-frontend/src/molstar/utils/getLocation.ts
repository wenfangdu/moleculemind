import { StructureElement, Unit } from "molstar/lib/mol-model/structure";
import { Loci } from "molstar/lib/mol-model/structure/structure/element/loci";
import { SequenceWrapper as TSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/wrapper";
import { Stats } from "../loci-stats";
import { isArray, isEmpty, isString } from "lodash";
import { TLocation } from "@/interface";
import { TStrucrtureWrappers, TStructure } from "../interface/sequence";


export function getLocationByStats({
  stats,
  loci,
  structures,
  structuresWrappers,
  structureCells,
}: {
  stats: StructureElement.Stats,
  loci?: Loci
  
  structures: TStructure[]
  structuresWrappers: TStrucrtureWrappers[]
  structureCells: any[] 
}): TLocation | undefined {
  const atomIndex = stats.firstElementLoc.element
  const targetStructureFromStats = stats.firstElementLoc.structure || stats.firstStructureLoc.structure;
  const targetUnitFromStats = stats.firstElementLoc.unit || stats.firstStructureLoc.unit;
  const elements: number[] = [];
  const chainGroupId = targetUnitFromStats.chainGroupId;


  const index = structures.findIndex(s => s.detail?.model.id === targetStructureFromStats.model.id);
  if (index !== -1) {
    const structure = structures[index].detail
    const workWrappersObj = structuresWrappers[index]
    const workWrappers = workWrappersObj?.wrappers;

    const wrapper = workWrappers.find(w => w.chainGroupId === chainGroupId);

    if (!wrapper) {
      return undefined
    }
  
    // @ts-ignore
    const chainIndex = structure?.model.sourceData.data.db.atom_site.auth_seq_id.toArray()[atomIndex] as number
  
    // @ts-ignore
    const seqIdx = targetUnitFromStats.residueIndex[atomIndex]
  
    // @ts-ignore
    const residueIndex = Array.from(targetUnitFromStats.residueIndex);
    // @ts-ignore
    const asmIdArray = structure.model.sourceData.data.db.atom_site.auth_asym_id.toArray() as string[]
  
    // const elementsStart = residueIndex.indexOf(seqIdx);
    // if (elementsStart !== -1) {
    for (let i = atomIndex; i < residueIndex.length; i++) {
      const value = residueIndex[i];
      if (value === seqIdx) {
        elements.push(i);
      } else {
        break
      }
    }
    // }
  
    const wrapperKey = wrapper.key;
    if (!loci && typeof wrapper.wrapper !== 'string') {
      loci = wrapper.wrapper.getLoci(seqIdx)
    }
  
    // @ts-ignore
    return {
      loci,
      // chainType: wrapper?.chainType,
      // @ts-ignore
      chainName: wrapper?.wrapper?.asymId || asmIdArray[atomIndex],
      structureKey: workWrappersObj?.structureKey,
      wrapperKey,
      elements,
      chainGroupId,
      atomIndex,
      seqIdx,
      chainIndex,
    }
  } else {
    return undefined;
  }

}