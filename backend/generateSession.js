const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const input = require('input');

const apiId = 37145707;
const apiHash = '562ff1741e94ddd33b19277e53616707';
const stringSession = new StringSession('');

(async () => {
  console.log('Loading interactive example...');
  const client = new TelegramClient(stringSession, apiId, apiHash, { connectionRetries: 5 });
  
  await client.start({
    phoneNumber: async () => await input.text('Please enter your number: '),
    password: async () => await input.text('Please enter your password: '),
    phoneCode: async () => await input.text('Please enter the code you received: '),
    onError: (err) => console.log(err),
  });

  console.log('You should now be connected.');
  console.log('YOUR SESSION STRING IS BELOW:');
  console.log('---------------------------');
  console.log(client.session.save());
  console.log('---------------------------');
  console.log('Save this string somewhere safe, and paste it into Railway TELEGRAM_SESSION variable!');
  
  await client.sendMessage('me', { message: 'Session generated successfully!' });
  process.exit(0);
})();
