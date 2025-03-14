import { useCallback } from "react";
import { TMolstarPlugin, TSelection } from "./interface/utils";
import { useLatest } from "ahooks";
import { Loci as ElementLoci } from "molstar/lib/mol-model/structure/structure/element/loci";
import { TStructure, TStructureDetail } from "./interface/sequence";
import { StructureRef } from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { Overpaint } from "molstar/lib/mol-theme/overpaint";
import { QueryContext, Structure, StructureElement, StructureSelection } from "molstar/lib/mol-model/structure";
import { compile } from "molstar/lib/mol-script/runtime/query/base";
import { StateSelection } from "molstar/lib/mol-state";
import { Color } from "molstar/lib/mol-util/color";
import { TLocation } from "@/interface";

type TProps = {
  plugin: TMolstarPlugin;
  selections: TLocation[];
  structures: TStructure[]
}

function getFilteredBundle(layers: Overpaint.BundleLayer[], structure: Structure) {
  const overpaint = Overpaint.ofBundle(layers, structure.root);
  const merged = Overpaint.merge(overpaint);
  return Overpaint.filter(merged, structure) as Overpaint<StructureElement.Loci>;
}

const Colors = [
  16711680,
  16744192,
  16776960,
  65280,
  255,
  4922882,
  9109503,
]

const OverpaintManagerTag = 'overpaint-controls';
export default function useHandleChangeColor({ plugin, selections, structures }: TProps) {

  const selectionsLatestRef = useLatest(selections)
  const structuresLatestRef = useLatest(structures)
  const changeColor = useCallback(async () => {


  }, [plugin])
  return {
    changeColor
  }
}