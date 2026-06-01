import { callCallableExpectData } from './callable'

export const MailService = {
  send(mail) {
    return callCallableExpectData('mail-sendEmail', mail, 'Failed to send email')
  },
}
