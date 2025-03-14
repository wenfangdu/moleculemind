import type { Loci as ElementLoci } from "molstar/lib/mol-model/structure/structure/element/loci";

type ValueOf<T> = T[keyof T];

export type TLocation = {
  loci?: ElementLoci,
  structureKey: string,
  wrapperKey?: string,
  chainGroupId: number
  atomIndex?: number;
  seqIdx?: number;
  chainIndex: number
  elements: number[]
  chainType?: string,
  chainName?: string
  molecule?: string;
}
