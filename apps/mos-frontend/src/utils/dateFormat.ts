export default function dateFormat(timeNum: number | string) {
  const realTimeNum = Number(`${timeNum}000`);
  const date = new Date(realTimeNum)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${getMinutes(date)}:${getSeconds(date)}`
}

function getMinutes(date: Date) {
  let minutes = date.getMinutes();
  return minutes < 10 ? `0${minutes}` : minutes;
}

function getSeconds(date: Date) {
  let minutes = date.getSeconds();
  return minutes < 10 ? `0${minutes}` : minutes;
}