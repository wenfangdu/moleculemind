import { getFileNameInfo } from "molstar/lib/mol-util/file-info"
import { OpenFiles } from "molstar/lib/mol-plugin-state/actions/file"
import { Asset } from "molstar/lib/mol-util/assets"
import { TDataResolverOptions } from "../interface/utils"

export async function workflowPipe(data: any, flow: string, options?: any):Promise<any> {
  if (flow === 'handleFilesDrop') {
    return handleFilesDrop(data, options)
  }
  if (flow === 's3Url') {
    return handleS3Url(data, options)
  }
  if (flow === 'fileParse') {
    return fileParse(data, options)
  }
  // if (flow === 'validateData') {
  //   return validateData(data, options)
  // }
  if (flow === 'handleBufferData') {
    return handleBufferData(data, options)
  }
  return data
  // if (flow === 'renderData') {
  //   return handleRenderData(data, options)
  // }
  // if (flow === 'error') {
  //   return handleError(data, options)
  // }
  return true
}

async function handleS3Url(data: string, options?: any){
  options?.handleStateChange({
    from: 's3',
  })
  return handleUrlFetch({url: data}, options, '')
}

async function handleUrlFetch(data: any, options: any, filename: string) {
  options?.handleStateChange({
    msg: 'start fetching',
    status: 'fetching',
  })
  return new Promise((res, rej) => {
    let bufferData:any, length: number;
    const request = new Request(data.url, data.options)
    fetch(request)
    .then(function(response) {
      length = Number(response.headers.get("content-length")) || 0;
      return response.arrayBuffer();
    }).then(function(chunk) {
      if (!bufferData) {
        bufferData = chunk;
      } else {
        bufferData = Buffer.concat([bufferData, chunk]);
      }
      options?.handleStateChange?.({
        status: 'fetching',
        msg: `load data from url: ${bufferData?.byteLength}/${length}`
      })
    }).finally(async () => {
      options?.handleStateChange?.({
        status: 'fetched',
        msg: `load data from url succeed`
      })
      const file = new File([bufferData], filename)

      res(workflowPipe([file], 'handleFilesDrop', options))
      // res(workflowPipe(bufferData, 'handleBufferData', options))
    })
  })
}

async function handleBufferData(data: any, options?: any) {
  try {
    const respDataString = new TextDecoder().decode(data)
    // const respData = JSON.parse(respDataString)
    return workflowPipe(respDataString, 'validateData', options)
  } catch(e) {
    return workflowPipe('buffer data parse error', 'error', options)
  }
}

async function handleFilesDrop(data: any, options?: any) {
  options?.handleStateChange({
    from: 'local drop',
  })
  if (data?.length > 1) {
    return Promise.all(data?.map((file: any) => workflowPipe(file, 'fileParse', options)))
  }
  return workflowPipe(data[0], 'fileParse', options)
}

const FileFormatMap = [
  {format: '.zip', parse: unzipFile},
  {format: '.pdb', parse: parsePdbFile},
  // {format: '.molx', parse: parsePdbFile},
  {format: '.molj', parse: parseJsonFile},
  {format: '.json', parse: parseJsonFile},
  // {format: '.molx', parse: readFile},
  // {format: '.molj', parse: readFile},
]

async function parseJsonFile(file: any, options: TDataResolverOptions) {
  const { plugin } = options;
  plugin.managers.snapshot.open(file)
}

async function parsePdbFile(file: any, options?: any) {
  const { plugin } = options

//   plugin.runTask(plugin.state.data.applyAction(OpenFiles, {
//     files: [file].map(f => Asset.File(f)),
//     format: { name: 'auto', params: {} },
//     visuals: true
// }));

  // plugin.managers.dragAndDrop.handle([file]);

  
  try {
    const _file = Asset.File(file)
    _file.name = _file.name.replace('.pdb', '')
    const info = getFileNameInfo(file?.name ?? '');
    const isBinary = plugin.dataFormats.binaryExtensions.has(info.ext);
    const { data } = await plugin.builders.data.readFile({ file: _file, isBinary });

    const provider = 
        plugin.dataFormats.auto(info, data.cell?.obj!);
    const parsed = await provider.parse(plugin, data);
    let result = await provider.visuals?.(plugin, parsed);
  } catch(e) {
    console.error({
      e
    })
  }

  // console.log({
  //   parsed
  // })
}

async function fileParse(data: any, options?: any) {
  options?.handleStateChange({
    msg: 'got to parse file',
    status: 'parsing'
  })
  const filename = data.name.toLowerCase();
  for (let i = 0; i < FileFormatMap.length; i++) {
    const {format, parse} = FileFormatMap[i];
    if (filename.endsWith(format)) {
      return parse(data, options)
    }
  }
  return workflowPipe('file format is not supportted', 'error', options)
}

async function readFile(data: any, options?: any){
  options?.handleStateChange({
    msg: 'start reading dropped file',
    status: 'reading'
  })
  return new Promise((res) => {
    const reader = new FileReader();
    reader.onprogress = function(e) {
    }
    reader.onloadend = function(e) {
      const result = e?.target?.result;
      options?.handleStateChange({
        msg: 'file alread read',
        status: 'readDone'
      })
      res(workflowPipe(result, 'handleBufferData' ,options))
    }
    reader.readAsArrayBuffer(data);
  })
}

async function unzipFile(data:any, options?: any) {
  const files = await asyncResp([{name: 'a'}, {name: 'b'}, {name: 'c'}])
  return Promise.all(files.map((file:any) => workflowPipe(file, 'fileParse', options)))
}

function asyncResp(data: any, t = 500):Promise<any> {
  return new Promise((res) => {
    setTimeout(() => {
      res(data)
    }, t)
  })
}


export function validUrl(input:string) {
  let url;
  try {
    url = new URL(input);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function getUrlInfo(input: string) {
  return new URL(input);
}

export function getInitOptions({
  handleTaskStateChange,
  otherOptions,
}: {
  handleTaskStateChange: (v:any, d:any) => void
  otherOptions?: any
}) {
  const options = {
    handleStateChange: (state:any) => handleTaskStateChange(options, state),
    ...(otherOptions || {})
  }
  return options;
}

function handleRenderData(data: any, options: any) {
  options?.handleStateChange({
    data,
    msg: 'displaying data~~~',
    status: 'done'
  })
}

function handleError(data: any, options: any) {
  options?.handleStateChange({
    msg: data,
    status: 'error'
  })
}