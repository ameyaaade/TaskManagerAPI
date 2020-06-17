const sendgridAPIKey = process.env.SENDGRID_API_KEY
const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(sendgridAPIKey);

sendWelcomeEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ameyaaade@gmail.com',
        subject:"Welcome to task management App !",
        text:`Welcome to the app, ${name}. Let me know how you get along with the app. `
    }).catch(e=>{
        console.log(e)
    });
}

sendCancelEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'ameyaaade@gmail.com',
        subject:"Account is cancelled !",
        text:`Account is cancelled, ${name}. Sorry to see you go !  `
    }).catch(e=>{
        console.log(e)
    });
}
module.exports={
    sendWelcomeEmail,
    sendCancelEmail
}