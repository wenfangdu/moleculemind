import { MolstarContext } from "@/molstar/context";
import { useSubscribe } from "@/molstar/useSubscribe";
import { distanceLabel } from "molstar/lib/mol-theme/label";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { DistanceData} from "molstar/lib/mol-repr/shape/loci/distance"
type Props = {
  className?: string
}
const StructureList: FC<Props> = ({
  className
}) => {

  const { molstarPlugin } = useContext(MolstarContext)!;
  const { subscribe } = useSubscribe()
  const [distanceDatas, setDistanceDatas] = useState<string[]>([])

  const updateData = useCallback(() => {
    const {
      // labels,
      distances,
      // angles,
      // dihedrals,
      // orientations,
      // planes,
    } = molstarPlugin.managers.structure.measurement.state;
    const dDatas:string[] = []
    distances.forEach(d => {
      const selections = d.obj?.data.sourceData as Partial<DistanceData>;
      if (selections.pairs) {
        dDatas.push(distanceLabel(selections.pairs![0], { condensed: true, unitLabel: molstarPlugin.managers.structure.measurement.state.options.distanceUnitLabel }))
      }
    })
    setDistanceDatas(dDatas)
  }, [molstarPlugin])

  useEffect(() => {
    if (!molstarPlugin) {
      return
    }
    subscribe(molstarPlugin.managers.structure.measurement.behaviors.state, updateData)
  }, [molstarPlugin])
  return <div className={className}>
    <div>
      <div>Distances:</div>
      {distanceDatas.map(d => <div key={d} dangerouslySetInnerHTML={{__html: d}}></div>)}
    </div>
  </div>
}

export default StructureList