const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_EMAIL_API_KEY)

async function sendEmailAsync(to, subject, htmlBody) {
  try {
    const msg = {
      to: to,
      from: process.env.SENDGRID_EMAIL_FROM,
      subject: subject,
      html: htmlBody,
    }
    await sgMail.send(msg)
  } catch (error) {
    if (error.response) {
      throw error.response.body
    } else {
      throw error
    }
  }
}

exports.sendEmailToOwnerBikeStatusChanged = async (owner, bike) => {
  try {
    console.log('sendEmailToOwnerBikeStatusChanged')
    await sendEmailAsync(
      owner.email,
      'New information about your bike!',
      `<p>Hi ${owner.name},</p>
<br/>
<p>We have a change in the status of the case you reported with date ${bike.date.toLocaleDateString()}, regarding a stolen bike with license number <i>${
        bike.license_number
      }</i></p>
<br/>
<p>You can check it out <a href="#">here</a></p>.
<br/>
<p>Regards,</p>
<p>The Police</p>
  `
    )
  } catch (err) {
    console.log(err)
  }
}
