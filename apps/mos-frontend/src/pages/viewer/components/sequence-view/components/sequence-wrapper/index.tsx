import { MolstarContext } from "@/molstar/context";
import { TWrapper } from "@/molstar/interface/sequence";
import { useSubscribe } from "@/molstar/useSubscribe";
import { Tag } from "antd";
import { OrderedSet } from "molstar/lib/mol-data/int";
import { StructureElement, StructureProperties, Unit } from "molstar/lib/mol-model/structure";
import { SequenceWrapper as TSequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/wrapper";
import { Representation } from "molstar/lib/mol-repr/representation";
import { ButtonsType, ModifiersKeys, getButton, getButtons, getModifiers } from "molstar/lib/mol-util/input/input-observer";
import { MarkerAction } from "molstar/lib/mol-util/marker-action";
import { FC, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import styles from './index.less'
import classnames from "classnames";

type Props = {
  sequenceWrapper: TWrapper
  structureKey: string
}

const TagColorMap = {
  0: 'magenta',
  1: 'orange',
  2: 'green',
  default: 'blue'
}
const MaxSequenceNumberSize = 5

const SequenceWrapper: FC<Props> = ({
  sequenceWrapper,
  structureKey
}) => {
  const { molstarPlugin, handleRangeSelection } = useContext(MolstarContext)!;
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseDownLociRef = useRef<StructureElement.Loci | undefined>(undefined)
  const lastMouseOverSeqIdxRef = useRef(-1);
  const mouseDownLiciSeqIdxRef = useRef<number>(-1)

  const wrapper = useMemo(() => {
    return sequenceWrapper.wrapper as TSequenceWrapper.Any
  }, [sequenceWrapper])

  const title = useMemo(() => {
    return sequenceWrapper.label
  }, [sequenceWrapper])

  const location = useMemo(() => {
    return StructureElement.Location.create(void 0);
  }, [])

  const { subscribe } = useSubscribe()

  const getSequenceNumber = useCallback((seqIdx: number) => {
    let seqNum = '';
    const loci = (wrapper as TSequenceWrapper.Any).getLoci(seqIdx);
    const l = StructureElement.Loci.getFirstLocation(loci, location);
    if (l) {
      if (Unit.isAtomic(l.unit)) {
        const seqId = StructureProperties.residue.auth_seq_id(l);
        const insCode = StructureProperties.residue.pdbx_PDB_ins_code(l);
        seqNum = `${seqId}${insCode ? insCode : ''}`;
      } else if (Unit.isCoarse(l.unit)) {
        seqNum = `${seqIdx + 1}`;
      }
    }
    return seqNum;
  }, [])

  const sequenceNumberPeriod = useMemo(() => {
    if (wrapper.length > 10) return 10;
    const lastSeqNum = getSequenceNumber(wrapper.length - 1);
    if (lastSeqNum.length > 1) return 5;
    return 1;
  }, [wrapper])

  const highlightQueue = useMemo(() => new Subject<{ seqIdx: number,structureKey: string, buttons: number, button: number, modifiers: ModifiersKeys }>(), [])

  const getBackgroundColor = useCallback((marker: number) => {
    // TODO: make marker color configurable
    if (typeof marker === 'undefined') console.error('unexpected marker value');
    return marker === 0
      ? ''
      : marker % 2 === 0
        ? 'rgb(51, 255, 25)' // selected
        : 'rgb(255, 102, 153)'; // highlighted
  }, [])

  const updateMarker = useCallback(() => {
    if (!containerRef.current) return;
    const xs = containerRef.current.children;
    const { markerArray } = wrapper;
    const hasNumbers = true, period = sequenceNumberPeriod;

    // let first: HTMLSpanElement | undefined;

    let o = 0;
    for (let i = 0, il = markerArray.length; i < il; i++) {
      if (hasNumbers && i % period === 0 && i < il) o++;
      // o + 1 to account for help icon
      const span = xs[o] as HTMLSpanElement;
      if (!span) return;
      o++;

      // if (!first && markerArray[i] > 0) {
      //     first = span;
      // }

      const backgroundColor = getBackgroundColor(markerArray[i]);
      if (span.style.backgroundColor !== backgroundColor) span.style.backgroundColor = backgroundColor;
    }

    // if (first) {
    //     first.scrollIntoView({ block: 'nearest' });
    // }
  }, [])

  const lociHighlightProvider = useCallback((loci: Representation.Loci, action: MarkerAction) => {
    const changed = wrapper.markResidue(loci.loci, action);
    if (changed) updateMarker();
  }, [wrapper])

  const lociSelectionProvider = useCallback((loci: Representation.Loci, action: MarkerAction) => {
    const changed = wrapper.markResidue(loci.loci, action);
    if (changed) updateMarker();
  }, [wrapper])

  const getLoci = useCallback((seqIdx: number | undefined) => {
    if (seqIdx !== undefined) {
      const loci = wrapper.getLoci(seqIdx);
      if (!StructureElement.Loci.isEmpty(loci)) return loci;
    }
  }, [wrapper])

  const hover = useCallback((loci: StructureElement.Loci | undefined, buttons: ButtonsType, button: ButtonsType.Flag, modifiers: ModifiersKeys) => {
    const ev = { current: Representation.Loci.Empty, buttons, button, modifiers };
    if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
      ev.current = { loci };
    }
    molstarPlugin.behaviors.interaction.hover.next(ev);
  }, [])

  useEffect(() => {
    molstarPlugin.managers.interactivity.lociHighlights.addProvider(lociHighlightProvider);
    molstarPlugin.managers.interactivity.lociSelects.addProvider(lociSelectionProvider);

    subscribe(highlightQueue.pipe(throttleTime(3 * 16.666, void 0, { leading: true, trailing: true })), (e) => {
      const loci = getLoci(e.seqIdx < 0 ? void 0 : e.seqIdx);
      hover(loci, e.buttons, e.button, e.modifiers);
    });
    return () => {

    }
  }, [])

  const getResidueClass = useCallback((seqIdx: number, label: string) => {
    return label.length > 1
      ? wrapper.residueClass(seqIdx) + (seqIdx === 0 ? styles.sequenceValueLongBegin : styles.sequenceValueLong)
      : wrapper.residueClass(seqIdx);
  }, [wrapper])

  function residue(seqIdx: number, label: string, marker: number) {
    return <span key={seqIdx} data-seqid={seqIdx}
      style={{ backgroundColor: getBackgroundColor(marker) }} className={classnames(styles.sequenceValue, getResidueClass(seqIdx, label))}
    >{`${label}`}</span>;
  }

  const getSequenceNumberClass = useCallback((seqIdx: number, seqNum: string, label: string) => {
    const classList = [styles.sequenceNumber];
    if (seqNum.startsWith('-')) {
      if (label.length > 1 && seqIdx > 0) classList.push(styles.sequenceNumberLongNegative);
      else classList.push(styles.sequenceNumberNegative);
    } else {
      if (label.length > 1 && seqIdx > 0) classList.push(styles.sequenceNumberLong);
    }
    return classList.join(' ');
  }, [])

  const padSeqNum = useCallback((n: string) => {
    if (n.length < MaxSequenceNumberSize) return n + new Array(MaxSequenceNumberSize - n.length + 1).join('\u00A0');
    return n;
  }, [])

  const getSequenceNumberSpan = useCallback((seqIdx: number, label: string) => {
    const seqNum = getSequenceNumber(seqIdx);
    return <span key={`marker-${seqIdx}`} className={getSequenceNumberClass(seqIdx, seqNum, label)}>{padSeqNum(seqNum)}</span>;
  }, [getSequenceNumber])

  const wrapperElems = useMemo(() => {
    if (typeof wrapper !== 'string') {

      const elems: JSX.Element[] = [];

      const hasNumbers = true, period = sequenceNumberPeriod;
      for (let i = 0, il = wrapper.length; i < il; ++i) {
        const label = wrapper.residueLabel(i);
        // add sequence number before name so the html element do not get separated by a line-break
        if (hasNumbers && i % period === 0 && i < il) {
          elems[elems.length] = getSequenceNumberSpan(i, label);
        }
        // console.log(i)
        elems[elems.length] = residue(i, label, wrapper.markerArray[i]);
      }
      return elems
    }
  }, [wrapper])

  const click = useCallback((loci: StructureElement.Loci | undefined, buttons: ButtonsType, button: ButtonsType.Flag, modifiers: ModifiersKeys, seqIdx?: any) => {
    const ev = { current: Representation.Loci.Empty, buttons, button, modifiers, seqIdx };
    if (loci !== undefined && !StructureElement.Loci.isEmpty(loci)) {
      ev.current = { loci };
    }
    // if (!molstarPlugin.selectionMode) {
      // molstarPlugin.behaviors.interaction.selectionMode.next(true)
    // }

    molstarPlugin.behaviors.interaction.click.next(ev);
    // molstarPlugin.managers.structure.selection.modifyHistory

  }, [])

  const getSeqIdx = useCallback((e: React.MouseEvent) => {
    let seqIdx: number | undefined = undefined;
    const el = e.target as HTMLElement;
    if (el && el.getAttribute) {
      seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid')! : undefined;
    }
    return seqIdx;
  }, [])

  const contextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);


  const mouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    const seqIdx = getSeqIdx(e)!;
    // const seqInfo = getSeqInfo(e)
    const loci = getLoci(seqIdx);
    if (!loci)  return;
    const buttons = getButtons(e.nativeEvent);
    const button = getButton(e.nativeEvent);
    const modifiers = getModifiers(e.nativeEvent);

    click(loci, buttons, button, modifiers);
    mouseDownLociRef.current = loci;
    mouseDownLiciSeqIdxRef.current = seqIdx
  }, [getSeqIdx, getLoci, getButtons, getButton, getModifiers]);

  const mouseUp = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    // ignore mouse-up events without a bound loci
    if (mouseDownLociRef.current === undefined) return;

    const seqIdx = getSeqIdx(e);
    const loci = getLoci(seqIdx);

    if (loci && !StructureElement.Loci.areEqual(mouseDownLociRef.current, loci)) {
      const buttons = getButtons(e.nativeEvent);
      const button = getButton(e.nativeEvent);
      const modifiers = getModifiers(e.nativeEvent);

      // const ref = mouseDownLociRef.current.elements[0];
      // const ext = loci.elements[0];
      // const min = Math.min(OrderedSet.min(ref.indices), OrderedSet.min(ext.indices));
      // const max = Math.max(OrderedSet.max(ref.indices), OrderedSet.max(ext.indices));

      // const range = StructureElement.Loci(loci.structure, [{
      //   unit: ref.unit,
      //   indices: OrderedSet.ofRange(min as StructureElement.UnitIndex, max as StructureElement.UnitIndex)
      // }]);
      // click(StructureElement.Loci.subtract(range, mouseDownLociRef.current), buttons, button, modifiers, seqIdx);

      click(mouseDownLociRef.current, buttons, button, modifiers);



      // @ts-ignore
      handleRangeSelection(wrapper, mouseDownLiciSeqIdxRef.current, seqIdx!, structureKey, sequenceWrapper.key)
    }

    mouseDownLociRef.current = undefined;
    mouseDownLiciSeqIdxRef.current = -1;
  }, [getSeqIdx, getLoci]);

  const mouseMove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    const buttons = getButtons(e.nativeEvent);
    const button = getButton(e.nativeEvent);
    const modifiers = getModifiers(e.nativeEvent);

    const el = e.target as HTMLElement;
    if (!el || !el.getAttribute) {
      if (lastMouseOverSeqIdxRef.current === -1) return;
      lastMouseOverSeqIdxRef.current = -1;
      highlightQueue.next({ seqIdx: -1, structureKey, buttons, button, modifiers });
      return;
    }
    const seqIdx = el.hasAttribute('data-seqid') ? +el.getAttribute('data-seqid')! : -1;
    if (lastMouseOverSeqIdxRef.current === seqIdx) {
      return;
    } else {
      lastMouseOverSeqIdxRef.current = seqIdx;
      if (mouseDownLociRef.current !== undefined) {
        const loci = getLoci(seqIdx);
        hover(loci, ButtonsType.Flag.None, ButtonsType.Flag.None, { ...modifiers, shift: true });
      } else {
        highlightQueue.next({ seqIdx, structureKey, buttons, button, modifiers });
      }
    }
  }, [getLoci]);

  const mouseLeave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    mouseDownLociRef.current = undefined;
    mouseDownLiciSeqIdxRef.current = -1;

    if (lastMouseOverSeqIdxRef.current === -1) return;
    lastMouseOverSeqIdxRef.current = -1;
    const buttons = getButtons(e.nativeEvent);
    const button = getButton(e.nativeEvent);
    const modifiers = getModifiers(e.nativeEvent);
    highlightQueue.next({ seqIdx: -1, structureKey, buttons, button, modifiers });
  }, []);


  return <div className={styles.root}>
    <div>
      {
        title.split('|').map((tag, i) => {
          // @ts-ignore
          return <Tag key={tag} color={TagColorMap[i] || TagColorMap.default}>{tag}</Tag>
        })
      }
      {/* <Tag>{title}</Tag> */}
    </div>
    <div ref={containerRef}
      className={styles.sequenceContainer}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
      onContextMenu={contextMenu}
    >{wrapperElems}</div>
  </div>
}

export default SequenceWrapper