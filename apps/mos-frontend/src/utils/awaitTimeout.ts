export default function awaitTimeout(t = 200) {
  return new Promise(res => {
    setTimeout(res, t)
  })
}