import { Loci as ElementLoci } from "molstar/lib/mol-model/structure/structure/element/loci";
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";

export type TMolstarPlugin = PluginUIContext

export type TDataResolverOptions = {
  plugin: TMolstarPlugin,
  handleStateChange: (v: any) => void;
  urlType?: string
}

export type TSelection = {
  loci: ElementLoci,
  label: string
}