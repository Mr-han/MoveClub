const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SENDGRID_API_KEY
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey)
}

/**
 * 单封邮件发送
 * @param {string} to 收件人邮箱
 * @param {string} subject 邮件标题
 * @param {string} content 邮件正文
 * @param {Buffer|null} attachment 附件Buffer，可选
 * @param {string|null} attachmentName 附件名称，可选
 */
async function sendSingleEmail(
  to,
  subject,
  content,
  attachment = null,
  attachmentName = null,
) {
  const msg = {
    to,
    from: 'hanchaoqun@hotmail.com',
    subject,
    html: `<div style="font-family: Inter, Arial, sans-serif; font-size: 14px; color: #333;">${content}</div>`,
  }

  if (attachment && attachmentName) {
    msg.attachments = [
      {
        content: attachment.toString('base64'),
        filename: attachmentName,
        type: 'application/octet-stream',
        disposition: 'attachment',
      },
    ]
  }

  try {
    await sgMail.send(msg)
    console.log(`✅ Email sent to ${to}`)
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}`, err.response?.body || err.message)
  }
}

/**
 * 批量发送邮件（顺序一个一个发）
 * @param {Array<string>} recipients 邮件列表
 * @param {string} subject 邮件标题
 * @param {string} content 邮件内容
 * @param {Buffer|null} attachment 附件内容（可选）
 * @param {string|null} attachmentName 附件文件名（可选）
 */
async function sendBatchEmails(
  recipients,
  subject,
  content,
  attachment = null,
  attachmentName = null,
) {
  if (!sendGridApiKey) {
    throw new Error('SENDGRID_API_KEY is not configured')
  }

  for (const email of recipients) {
    await sendSingleEmail(email, subject, content, attachment, attachmentName)
  }
}

module.exports = {
  sendSingleEmail,
  sendBatchEmails,
}
