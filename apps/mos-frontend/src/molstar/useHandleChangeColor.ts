import { useCallback } from "react";
import { TMolstarPlugin } from "./interface/utils";
import { useLatest } from "ahooks";
import { TStructure } from "./interface/sequence";
import { StructureElement } from "molstar/lib/mol-model/structure";
import { Color } from "molstar/lib/mol-util/color";
import { TLocation } from "@/interface";
import { PluginStateObject } from "molstar/lib/mol-plugin-state/objects";
import { StateTransforms } from "molstar/lib/mol-plugin-state/transforms";
import { Overpaint } from "molstar/lib/mol-theme/overpaint";

type TProps = {
  plugin: TMolstarPlugin;
  selections: TLocation[];
  structures?: TStructure[]
}

const Colors = [
  16711680,  // 红色
  16744192,  // 橙色
  16776960,  // 黄色
  65280,     // 绿色
  255,       // 蓝色
  4922882,   // 青色
  9109503,   // 紫色
]

export default function useHandleChangeColor({ plugin, selections }: TProps) {

  const selectionsLatestRef = useLatest(selections)
  const changeColor = useCallback(async () => {
    const selections = selectionsLatestRef.current;

    if (!selections || selections.length === 0) {
      console.log('No selections to change color');
      return;
    }

    console.log('=== changeColor 开始执行 ===');
    console.log('selections:', selections);

    // 按结构分组
    const selectionsByStructure = new Map<any, { loci: StructureElement.Loci, color: Color }[]>();

    for (const selection of selections) {
      if (!selection.loci || StructureElement.Loci.isEmpty(selection.loci)) {
        console.log('跳过空的 loci');
        continue;
      }

      // 随机选择一个颜色
      const randomColorValue = Colors[Math.floor(Math.random() * Colors.length)];
      const randomColor = Color(randomColorValue);

      console.log('选择颜色:', randomColorValue);

      const structure = selection.loci.structure;
      if (!selectionsByStructure.has(structure)) {
        selectionsByStructure.set(structure, []);
      }
      selectionsByStructure.get(structure)!.push({
        loci: selection.loci,
        color: randomColor
      });
    }

    console.log('分组后的结构数量:', selectionsByStructure.size);

    // 为每个结构应用颜色
    for (const [structure, items] of selectionsByStructure) {
      try {
        const state = plugin.state.data;

        // 查找结构对应的 cell
        const structureCells = state.selectQ(q =>
          q.ofType(PluginStateObject.Molecule.Structure).filter(c => c.obj?.data === structure)
        );

        if (structureCells.length === 0) {
          console.log('未找到结构 cell');
          continue;
        }

        const structureCell = structureCells[0];
        console.log('找到结构 cell:', structureCell.transform.ref);

        // 查找表示节点
        const representations = state.selectQ(q =>
          q.byRef(structureCell.transform.ref).subtree().ofType(PluginStateObject.Molecule.Structure.Representation3D)
        );

        console.log('找到的表示节点数量:', representations.length);

        if (representations.length === 0) {
          console.log('未找到表示节点');
          continue;
        }

        // 为每个表示应用 overpaint
        for (const repr of representations) {
          console.log('正在为表示应用 overpaint:', repr.transform.ref);

          // 创建 overpaint layers
          const layers: Overpaint.BundleLayer[] = items.map(item => {
            const bundle = StructureElement.Bundle.fromLoci(item.loci);
            console.log('创建 bundle:', {
              loci: item.loci,
              bundle: bundle,
              color: item.color,
              elementCount: StructureElement.Loci.size(item.loci)
            });
            return {
              bundle: bundle,
              color: item.color,
              clear: false
            };
          });

          const update = state.build();

          // 查找现有的 overpaint（使用标签来识别）
          const overpaintTag = 'overpaint-from-selection';
          const overpaintNodes = state.selectQ(q =>
            q.byRef(repr.transform.ref).subtree().withTag(overpaintTag)
          );

          if (overpaintNodes.length > 0) {
            console.log('找到现有的 overpaint，将删除');
            // 删除旧的 overpaint
            for (const node of overpaintNodes) {
              update.delete(node.transform.ref);
            }
          }

          // 创建新的 overpaint
          console.log('创建新的 overpaint, layers:', layers.length);
          console.log('layers 详情:', layers);

          update
            .to(repr.transform.ref)
            .apply(StateTransforms.Representation.OverpaintStructureRepresentation3DFromBundle, { layers }, { tags: overpaintTag });

          await update.commit();
          console.log('overpaint 已提交');

          // 强制重绘
          plugin.canvas3d?.requestDraw();
          console.log('已请求重绘 canvas3d');
        }
      } catch (e) {
        console.error('应用颜色时出错:', e);
      }
    }

    console.log('=== changeColor 执行完毕 ===');
  }, [plugin])
  return {
    changeColor
  }
}
