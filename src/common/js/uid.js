let _uid = 0

/* 生成请求歌曲时需要的uid */
export function getUid() {
  if (_uid) {
    return _uid
  }
  if (!_uid) {
    const t = (new Date()).getUTCMilliseconds()
    _uid = Math.round(2147483647 * Math.random()) * t % 1e10
  }
  return _uid
}
