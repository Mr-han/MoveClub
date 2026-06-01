const { sendBatchEmails } = require('./emailSender')
const { wrapOnCall } = require('./utils')

const sendEmail = wrapOnCall(async (data) => {
  const { recipients, subject, content, attachment, attachmentName } = data

  if (!recipients || !Array.isArray(recipients) || !recipients.length) {
    throw new Error('Recipients required')
  }
  if (!subject || !content) {
    throw new Error('Subject and content required')
  }

  // 限制附件大小 < 10MB
  if (attachment && attachment.length > 10 * 1024 * 1024) {
    throw new Error('Attachment too large (max 10MB)')
  }

  // 批量发送邮件
  await sendBatchEmails(
    recipients,
    subject,
    content,
    attachment ? Buffer.from(attachment, 'base64') : null,
    attachmentName || null,
  )

  return { sent: recipients.length }
})

module.exports = { sendEmail }
