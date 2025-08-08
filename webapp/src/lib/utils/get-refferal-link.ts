const botUsername = process.env.BOT_USERNAME;

export const getRefferalLink = (telegramId: string) => {
  return `https://t.me/${botUsername}?start=ref_${telegramId}`;
};
