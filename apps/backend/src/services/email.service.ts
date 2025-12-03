import logger from "@/config/logger";

interface EmailJob {
  type: "otp" | "password_reset" | "notification";
  to: string;
  subject: string;
  data: Record<string, string | number | boolean>;
}

class EmailService {
  private queue: EmailJob[] = [];

  constructor() {
    // Start processing queue
    this.processQueue();
  }

  async queueOtpEmail(email: string, otpCode: string) {
    this.queue.push({
      type: "otp",
      to: email,
      subject: "Verify Your Account - OTP Code",
      data: { otpCode },
    });
  }

  async queuePasswordResetEmail(email: string, resetToken: string) {
    this.queue.push({
      type: "password_reset",
      to: email,
      subject: "Password Reset Request",
      data: { resetToken },
    });
  }

  async queueNotificationEmail(
    email: string,
    subject: string,
    data: Record<string, string | number | boolean>
  ) {
    this.queue.push({
      type: "notification",
      to: email,
      subject,
      data,
    });
  }

  private async processQueue() {
    setInterval(async () => {
      if (this.queue.length === 0) return;

      const job = this.queue.shift();
      if (!job) return;

      try {
        await this.sendEmail(job);
      } catch (error) {
        logger.error("Failed to send email", { error, job });
        // Re-queue failed jobs (simple retry mechanism)
        this.queue.unshift(job);
      }
    }, 1000); // Process every second
  }

  private async sendEmail(job: EmailJob) {
    // TODO: Implement actual email sending logic
    // For now, just log the email content
    logger.info("Sending email", {
      to: job.to,
      subject: job.subject,
      type: job.type,
      data: job.data,
    });

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export const emailService = new EmailService();
