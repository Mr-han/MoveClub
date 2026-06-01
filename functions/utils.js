const admin = require('firebase-admin')
const { onCall } = require('firebase-functions/v2/https')

/**
 * wrapOnCall: 统一处理登录和返回数据格式
 * @param {Function} handler 业务逻辑函数 (data) => Promise<any>
 * @param {boolean} requireAuth 是否必须登录
 */
function wrapOnCall(handler, requireAuth = true, requireAdmin = false) {
  return onCall({ region: 'asia-southeast1', memory: '512MB' }, async (request) => {
    console.log('++++++++++++++', request)
    try {
      if (requireAuth && !request.auth) {
        return {
          code: 401, // 自定义未登录业务码
          message: 'User must be logged in',
          data: null,
        }
      }
      if (requireAdmin) {
        const uid = request.auth.uid
        const userDoc = await admin.firestore().collection('users').doc(uid).get()
        const userData = userDoc.data()
        if (!userData || userData.role !== 'Admin') {
          return {
            code: 403,
            message: 'User does not have admin privileges',
            data: null,
          }
        }
      }
      const result = await handler(request.data, request)
      return {
        code: 200, // 0 表示成功
        message: 'success',
        data: result,
      }
    } catch (err) {
      console.error(err)
      return {
        code: 500, // 自定义未知错误码
        message: err.message || 'Internal error',
        data: null,
      }
    }
  })
}

module.exports = { wrapOnCall }
