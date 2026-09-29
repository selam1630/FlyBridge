import prisma from '../config/db.js';
import crypto from 'crypto';
import { sendVerificationEmail } from './emailController.js';
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
    const user = await prisma.user.updateMany({
      where: { email },
      data: { otpCode: otp, otpExpiry: expiryTime },
    });
    if (user.count === 0) {
      return res.status(404).json({ message: 'User not found with this email address.' });
    }
    try {
      await sendVerificationEmail(email, otp);
    } catch (mailError) {
      await prisma.user.updateMany({ where: { email }, data: { otpCode: null, otpExpiry: null } });
      console.error('OTP email delivery failed:', mailError.message);
      return res.status(503).json({ message: 'Could not send the verification email. Check the SMTP settings and try again.' });
    }
    res.json({ message: 'OTP sent successfully.' });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Something went wrong while sending OTP.' });
  }
};
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
    }
    await prisma.user.update({
      where: { email },
      data: {
        phoneVerified: true,
        otpCode: null,
        otpExpiry: null,
      },
    });
    res.json({ message: 'Email address verified successfully.' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Something went wrong during verification.' });
  }
};
