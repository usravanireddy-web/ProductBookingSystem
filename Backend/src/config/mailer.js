const nodemailer = require('nodemailer');

const hasMailConfiguration = () =>
  Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS,
  );

const productImages = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=700&q=80',
];
const productImage = (id) =>
  productImages[((Number(String(id).match(/\d+$/)?.[0]) || 1) - 1) % productImages.length];

const sendBookingConfirmation = async ({ to, fullName, booking, product }) => {
  if (!to || !hasMailConfiguration()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const unitPrice = Number.isFinite(Number(product.price)) ? Number(product.price) : 0;
  const total = unitPrice * booking.requiredQuantity;
  const frontendUrl =
    process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173';
  const productLink = `${frontendUrl.replace(/\/$/, '')}/?productId=${encodeURIComponent(booking.productId)}`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: `Booking confirmed: ${booking.bookingId}`,
    text: [
      `Hello ${fullName || 'Customer'},`,
      '',
      'Your Cash on Delivery booking has been confirmed.',
      `Booking ID: ${booking.bookingId}`,
      `Product: ${product.name} (${booking.productId})`,
      `Quantity: ${booking.requiredQuantity}`,
      'Status: Open',
      '',
      'Thank you for choosing Bookflow.',
    ].join('\n'),
    html: `<!doctype html><html><body style="margin:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#17231f"><div style="max-width:620px;margin:28px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dce8df"><div style="padding:24px 30px;background:#155c42;color:#fff"><div style="font-size:18px;font-weight:700;letter-spacing:1px">BOOKFLOW</div><div style="margin-top:8px;font-size:25px;font-weight:700">Your order is confirmed</div><div style="margin-top:8px;color:#d5efdf">Cash on Delivery · Booking ${booking.bookingId}</div></div><div style="padding:28px 30px"><p style="margin-top:0">Hello ${fullName || 'Customer'},</p><p>Your product booking has been received and is being processed.</p><table role="presentation" width="100%" style="border:1px solid #e2e9e4;border-radius:12px;border-spacing:0"><tr><td style="padding:16px;width:120px"><img src="${productImage(booking.productId)}" alt="${product.name}" width="105" height="105" style="display:block;object-fit:cover;border-radius:10px"></td><td style="padding:16px"><div style="font-size:12px;color:#64766b;letter-spacing:1px">${booking.productId}</div><div style="font-size:20px;font-weight:700;margin:5px 0 15px">${product.name}</div><div style="font-size:14px;color:#52685a">Quantity: <b>${booking.requiredQuantity}</b></div><div style="font-size:14px;color:#52685a">Unit price: ₹${unitPrice.toLocaleString('en-IN')}</div></td></tr></table><div style="display:flex;justify-content:space-between;margin:22px 0;padding:16px;background:#edf6ef;border-radius:10px"><b>Total</b><b style="font-size:21px;color:#155c42">₹${total.toLocaleString('en-IN')}</b></div><p style="font-size:14px;color:#52685a">Payment method: <b>Cash on Delivery</b><br>Status: <b>Open</b></p><a href="${productLink}" style="display:inline-block;background:#155c42;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">View product</a></div></div></body></html>`,
  });

  return true;
};

module.exports = { sendBookingConfirmation };
