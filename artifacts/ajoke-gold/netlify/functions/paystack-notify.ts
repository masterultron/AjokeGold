import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { reference, buyerName, buyerEmail, buyerPhone, items, currency } = JSON.parse(
      event.body || '{}'
    );

    // Build items table rows
    const itemRows = items
      ?.map(
        (item: { name: string; quantity: number; price: string }) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 10px;">${item.name}</td>
          <td style="padding: 10px; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; text-align: right;">${item.price}</td>
        </tr>`
      )
      .join('') ?? '';

    const { error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.STORE_OWNER_EMAIL!,
      subject: `💍 New Order from ${buyerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #b8860b;">💍 New Order on Ajoke Gold!</h2>

          <h3 style="color: #555; margin-top: 24px;">Customer Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold; width: 40%;">Name</td>
              <td style="padding: 10px;">${buyerName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold;">Email</td>
              <td style="padding: 10px;">${buyerEmail}</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px; font-weight: bold;">Phone</td>
              <td style="padding: 10px;">${buyerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 10px; font-weight: bold;">Payment Reference</td>
              <td style="padding: 10px; color: #888; font-size: 12px;">${reference}</td>
            </tr>
          </table>

          <h3 style="color: #555; margin-top: 24px;">Items Ordered (${currency})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f9f9f9;">
                <th style="padding: 10px; text-align: left;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <p style="margin-top: 24px; color: #555;">
            Reach out to the customer at <strong>${buyerEmail}</strong> or 
            <strong>${buyerPhone}</strong> to confirm and arrange delivery.
          </p>
        </div>
      `,
    });

    if (error) {
      return { statusCode: 500, body: JSON.stringify({ error }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) };
  }
};