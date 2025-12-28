import { TLocation } from "@/interface"
import { useCallback } from "react"
import { StructureElement } from "molstar/lib/mol-model/structure"
import { Vec3 } from "molstar/lib/mol-math/linear-algebra"
import { message } from "antd"

export default function useSetDistance({
  molstarPlugin
}: {
  molstarPlugin: any
}) {
  const setDistance = useCallback((a: TLocation, b: TLocation) => {
    if (!a?.loci || !b?.loci) {
      message.warning("无法获取选中位置信息");
      return;
    }

    try {
      // 获取第一个位置的坐标
      const statsA = StructureElement.Stats.ofLoci(a.loci);
      const locA = statsA.firstElementLoc;
      const posA = Vec3();
      locA.unit.conformation.position(locA.element, posA);

      // 获取第二个位置的坐标
      const statsB = StructureElement.Stats.ofLoci(b.loci);
      const locB = statsB.firstElementLoc;
      const posB = Vec3();
      locB.unit.conformation.position(locB.element, posB);

      // 计算欧几里得距离
      const distance = Vec3.distance(posA, posB);

      // 显示距离信息
      message.success(`两个氨基酸之间的距离: ${distance.toFixed(2)} Å`);

      console.log('Distance between selected amino acids:', {
        distance: distance.toFixed(2) + ' Å',
        position1: posA,
        position2: posB,
        aminoAcid1: a,
        aminoAcid2: b
      });

      return distance;
    } catch (error) {
      console.error('计算距离时出错:', error);
      message.error("计算距离失败");
      return undefined;
    }
  }, [molstarPlugin])

  return {
    setDistance
  }
}
