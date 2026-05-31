export async function sendEmailViaLambda(
  to: string,
  subject: string,
  html: string,
  fromEmail: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const lambdaUrl = Deno.env.get("LAMBDA_EMAIL_ENDPOINT");
    const apiKey = Deno.env.get("LAMBDA_API_KEY");

    if (!lambdaUrl || !apiKey) {
      return { success: false, error: "Missing Lambda environment variables" };
    }

    const response = await fetch(lambdaUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
        from_email: fromEmail,
        from: fromEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Lambda email error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: String(err) };
  }
}