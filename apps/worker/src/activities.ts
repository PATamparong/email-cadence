export type SendEmailResult = {
  success: true;
  messageId: string;
  timestamp: number;
};

export async function sendEmail(args: {
  to: string;
  subject: string;
  body: string;
}): Promise<SendEmailResult> {
  // eslint-disable-next-line no-console
  console.log(`[MOCK EMAIL] To=${args.to} Subject="${args.subject}" Body="${args.body}"`);
  return {
    success: true,
    messageId: Math.random().toString(36).slice(2),
    timestamp: Date.now()
  };
}

